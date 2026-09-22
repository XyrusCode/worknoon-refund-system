import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/api";
import { customerQueryKeys } from "../query-keys/customer-query-keys";
import { defaultQueryOptions } from "../query-options";

export function useCustomersQuery() {
  return useQuery({
    queryKey: customerQueryKeys.list(),
    queryFn: () => apiClient.customers.list(),
    ...defaultQueryOptions,
  });
}

export function useCustomerQuery(id: string) {
  return useQuery({
    queryKey: customerQueryKeys.detail(id),
    queryFn: () => apiClient.customers.get(id),
    enabled: Boolean(id),
    ...defaultQueryOptions,
  });
}
