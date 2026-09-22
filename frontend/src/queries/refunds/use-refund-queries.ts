import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiClient,
  type CreateRefundPayload,
  type RefundRequest,
} from "../../lib/api";
import { refundQueryKeys } from "../query-keys/refund-query-keys";
import { shortLivedQueryOptions } from "../query-options";

export function useRefundsQuery(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: refundQueryKeys.list(filters),
    queryFn: () => apiClient.refunds.list(),
    ...shortLivedQueryOptions,
  });
}

export function useRefundQuery(id: string) {
  return useQuery({
    queryKey: refundQueryKeys.detail(id),
    queryFn: () => apiClient.refunds.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateRefundMutation() {
  const queryClient = useQueryClient();

  return useMutation<RefundRequest, Error, CreateRefundPayload>({
    mutationFn: (payload: CreateRefundPayload) =>
      apiClient.refunds.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: refundQueryKeys.all });
    },
  });
}
