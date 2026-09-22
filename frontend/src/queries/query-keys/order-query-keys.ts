export const orderQueryKeys = {
  all: ["orders"] as const,
  lists: () => [...orderQueryKeys.all, "list"] as const,
  byCustomer: (customerId: string) =>
    [...orderQueryKeys.all, "customer", customerId] as const,
  details: () => [...orderQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...orderQueryKeys.details(), id] as const,
};
