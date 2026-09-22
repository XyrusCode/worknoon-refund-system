import { HttpStatusCode } from "../overrides/axios";

const asStatus = (value: unknown): number | undefined => {
  if (typeof value === "number") {
    return value;
  }
  if (
    typeof value === "string" &&
    value.trim() !== "" &&
    !isNaN(Number(value))
  ) {
    return Number(value);
  }
  return undefined;
};

const statusesOf = (error: unknown): number[] => {
  if (typeof error !== "object" || error === null) {
    return [];
  }

  const statuses: number[] = [];

  if ("code" in error) {
    const code = asStatus((error as { code?: unknown }).code);
    if (code !== undefined) statuses.push(code);
  }

  if ("status" in error) {
    const status = asStatus((error as { status?: unknown }).status);
    if (status !== undefined) statuses.push(status);
  }

  if ("response" in error) {
    const { response } = error as { response?: { status?: unknown } };
    const status = asStatus(response?.status);
    if (status !== undefined) statuses.push(status);
  }

  return statuses;
};

export const shouldRetryQuery = (
  failureCount: number,
  error: unknown,
): boolean => {
  const statuses = statusesOf(error);

  const isAuthFailure = statuses.some(
    (status) =>
      status === HttpStatusCode.Unauthorized ||
      status === HttpStatusCode.Forbidden,
  );
  if (isAuthFailure) return false;

  const isUnrepeatableClientError = statuses.some(
    (status) =>
      status >= HttpStatusCode.BadRequest &&
      status < HttpStatusCode.InternalServerError &&
      status !== HttpStatusCode.RequestTimeout &&
      status !== HttpStatusCode.TooManyRequests,
  );
  if (isUnrepeatableClientError) return false;

  return failureCount < 1;
};
