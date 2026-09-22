import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/api";
import { orderQueryKeys } from "../query-keys/order-query-keys";
import { defaultQueryOptions } from "../query-options";

export function useOrdersQuery() {
  return useQuery({
    queryKey: orderQueryKeys.lists(),
    queryFn: () => apiClient.orders.list(),
    ...defaultQueryOptions,
  });
}

export function useCustomerOrdersQuery(customerId: string) {
  return useQuery({
    queryKey: orderQueryKeys.byCustomer(customerId),
    queryFn: () => apiClient.orders.byCustomer(customerId),
    enabled: Boolean(customerId),
    ...defaultQueryOptions,
  });
}

export function useOrderQuery(id: string) {
  return useQuery({
    queryKey: orderQueryKeys.detail(id),
    queryFn: () => apiClient.orders.get(id),
    enabled: Boolean(id),
    ...defaultQueryOptions,
  });
}
