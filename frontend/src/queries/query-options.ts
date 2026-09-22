import type {
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { shouldRetryQuery } from "./should-retry-query";

/**
 * Standardized Query Options matching TabulaRasa & ERP patterns.
 */

/** Default query options: balanced freshness and performance (2m stale, 10m gc) */
export const defaultQueryOptions = {
  staleTime: 2 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
  retry: shouldRetryQuery,
  refetchOnWindowFocus: false,
} as const;

/** Frequently changing data (live updates, short poll) */
export const shortLivedQueryOptions = {
  staleTime: 5 * 1000,
  gcTime: 2 * 60 * 1000,
  retry: shouldRetryQuery,
  refetchOnWindowFocus: true,
  refetchInterval: 5000,
} as const;

/** Static / configuration data (rarely changing) */
export const longLivedQueryOptions = {
  staleTime: 30 * 60 * 1000,
  gcTime: 60 * 60 * 1000,
  retry: shouldRetryQuery,
  refetchOnWindowFocus: false,
} as const;

/** Search and filter queries */
export const searchQueryOptions = {
  staleTime: 1 * 60 * 1000,
  gcTime: 5 * 60 * 1000,
  retry: shouldRetryQuery,
  refetchOnWindowFocus: false,
} as const;

/** Mutation options for optimistic updates */
export const optimisticMutationOptions = {
  retry: 1,
} as const;

/** Mutation options for critical transactions */
export const criticalMutationOptions = {
  retry: 3,
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000),
} as const;

/** Helper function to create typed query options */
export const createQueryOptions = <
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
>(
  baseOptions: Partial<UseQueryOptions<TQueryFnData, TError, TData>>,
  customOptions?: Partial<UseQueryOptions<TQueryFnData, TError, TData>>,
): Partial<UseQueryOptions<TQueryFnData, TError, TData>> => {
  return {
    ...defaultQueryOptions,
    ...baseOptions,
    ...customOptions,
  };
};

/** Helper function to create typed mutation options */
export const createMutationOptions = <
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(
  baseOptions: Partial<UseMutationOptions<TData, TError, TVariables, TContext>>,
  customOptions?: Partial<
    UseMutationOptions<TData, TError, TVariables, TContext>
  >,
): UseMutationOptions<TData, TError, TVariables, TContext> => {
  return {
    ...optimisticMutationOptions,
    ...baseOptions,
    ...customOptions,
  };
};
