export const refundQueryKeys = {
  all: ["refunds"] as const,
  lists: () => [...refundQueryKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...refundQueryKeys.lists(), { filters }] as const,
  details: () => [...refundQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...refundQueryKeys.details(), id] as const,
};
