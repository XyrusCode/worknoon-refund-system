import { QueryClient } from "@tanstack/react-query";
import { defaultQueryOptions } from "../queries/query-options";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      ...defaultQueryOptions,
    },
    mutations: {
      retry: 1,
    },
  },
});
