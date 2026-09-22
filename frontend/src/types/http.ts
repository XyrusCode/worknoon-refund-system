export interface FetchResponseSuccess<T = unknown> {
  data: T;
  status: "success";
  message?: string;
}

export interface FetchResponseError {
  message: string;
  code: number;
  status: "error";
  url?: string;
  errors?: Record<string, string[]>;
}

export type FetchResponse<T = unknown> =
  FetchResponseSuccess<T> | FetchResponseError;
