import axios, {
  HttpStatusCode,
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type CreateAxiosDefaults,
  type InternalAxiosRequestConfig,
} from "axios";
import type { FetchResponseError } from "../types/http";

const PROD_API_BASE = "https://worknoon-refund-system-be.vercel.app/api";
const LOCAL_API_BASE = "http://localhost:3001/api";

const envApiUrl = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_URL;
const isBrowser = typeof window !== "undefined";
const isRemote = isBrowser && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";

const API_BASE: string = envApiUrl || (isRemote ? PROD_API_BASE : LOCAL_API_BASE);

const SENSITIVE_BODY_KEYS = new Set([
  "password",
  "password_confirmation",
  "current_password",
  "new_password",
  "token",
  "secret",
  "pin",
  "cvv",
  "apikey",
  "api_key",
]);

/**
 * Deep-clone request body data with sensitive fields replaced by '[redacted]'.
 */
export const scrubSensitiveData = (data: unknown): unknown => {
  if (typeof data === "string") {
    try {
      return JSON.stringify(scrubSensitiveData(JSON.parse(data) as unknown));
    } catch {
      return data;
    }
  }

  if (Array.isArray(data)) {
    return data.map(scrubSensitiveData);
  }

  if (typeof data === "object" && data !== null) {
    const scrubbed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(
      data as Record<string, unknown>,
    )) {
      scrubbed[key] = SENSITIVE_BODY_KEYS.has(key.toLowerCase())
        ? "[redacted]"
        : scrubSensitiveData(value);
    }
    return scrubbed;
  }

  return data;
};

/** Stop retrying after this many attempts and let the error surface. */
const MAX_RATE_LIMIT_RETRIES = 3;
const BASE_RATE_LIMIT_DELAY_MS = 500;
const MAX_RATE_LIMIT_DELAY_MS = 8_000;

type RateLimitedConfig = AxiosRequestConfig & {
  __rateLimitRetryCount?: number;
};

/**
 * How long to wait before re-sending a rate-limited request.
 * Honors Retry-After header or falls back to exponential backoff with jitter.
 */
export const resolveRateLimitDelay = (
  retryAfter: string | undefined,
  attempt: number,
  random: () => number = Math.random,
): number => {
  if (retryAfter !== undefined && retryAfter.trim() !== "") {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds)) {
      return Math.max(0, seconds * 1000);
    }
    const retryAt = Date.parse(retryAfter);
    if (!Number.isNaN(retryAt)) {
      return Math.max(0, retryAt - Date.now());
    }
  }

  const backoff = Math.min(
    BASE_RATE_LIMIT_DELAY_MS * 2 ** attempt,
    MAX_RATE_LIMIT_DELAY_MS,
  );

  return Math.min(backoff + random() * backoff * 0.5, MAX_RATE_LIMIT_DELAY_MS);
};

const axiosConfig: CreateAxiosDefaults = {
  baseURL: API_BASE.endsWith("/") ? API_BASE : `${API_BASE}`,
  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
};

const axiosInstance = axios.create(axiosConfig);

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (
    error: AxiosError<{
      message?: string | string[];
      error?: string;
      errors?: Record<string, string[]>;
    }>,
  ) => {
    // Handle rate limiting (429) with automatic retry
    const { config, response } = error;
    if (response?.status === HttpStatusCode.TooManyRequests && config) {
      const rateLimitedConfig = config as RateLimitedConfig;
      const attempt = rateLimitedConfig.__rateLimitRetryCount ?? 0;

      if (attempt < MAX_RATE_LIMIT_RETRIES) {
        const retryConfig: RateLimitedConfig = {
          ...rateLimitedConfig,
          __rateLimitRetryCount: attempt + 1,
        };
        const delay = resolveRateLimitDelay(
          response.headers?.["retry-after"] as string | undefined,
          attempt,
        );

        return new Promise((resolve) => {
          setTimeout(resolve, delay);
        }).then(() => axiosInstance.request(retryConfig));
      }
    }

    const rawMessage = error.response?.data?.message;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(", ")
      : rawMessage || error.message || "Request failed";

    const normalizedError: FetchResponseError = {
      message,
      code: error.response?.status || HttpStatusCode.InternalServerError,
      status: "error",
      url: error.config?.url,
      errors: error.response?.data?.errors,
    };

    return Promise.reject(normalizedError);
  },
);

/**
 * Adapter for Wayfinder-generated action descriptors ({ url, method }) or direct URL strings.
 * Forwards everything else (params, data, headers) to the shared axios instance.
 */
export const apiRequest = <T = unknown>(
  action: string | { url: string; method: string },
  config: AxiosRequestConfig = {},
): Promise<T> => {
  const url = typeof action === "string" ? action : action.url;
  const method =
    typeof action === "string"
      ? config.method || "GET"
      : (action.method as AxiosRequestConfig["method"]);

  return axiosInstance.request({
    url,
    method,
    ...config,
  }) as unknown as Promise<T>;
};

export default axiosInstance;
export { HttpStatusCode };
