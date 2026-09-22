/**
 * Common API Types
 */

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
  links?: {
    first?: string;
    last?: string;
    prev?: string | null;
    next?: string | null;
  };
}

export interface ListParams {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: unknown;
}

export interface ApiError {
  message: string;
  code: number;
  status: "error";
  url?: string;
  errors?: Record<string, string[]>;
}

export interface ApiSuccess<T = unknown> {
  data: T;
  message?: string;
  status: "success";
}
