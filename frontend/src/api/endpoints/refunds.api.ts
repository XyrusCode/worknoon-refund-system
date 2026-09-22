import { apiRequest } from "../../overrides/axios";
import { RefundsActions } from "../../actions/refunds.actions";
import type { RefundRequest, CreateRefundPayload } from "../../lib/api";

/**
 * Refunds API endpoints invoking Wayfinder action descriptors.
 */
export const refundsApi = {
  list: async (): Promise<RefundRequest[]> => {
    return apiRequest<RefundRequest[]>(RefundsActions.index());
  },

  get: async (id: string): Promise<RefundRequest> => {
    return apiRequest<RefundRequest>(RefundsActions.show(id));
  },

  create: async (data: CreateRefundPayload): Promise<RefundRequest> => {
    return apiRequest<RefundRequest>(RefundsActions.create(), {
      data: {
        customerId: data.customerId,
        orderId: data.orderId,
        message: data.message || data.customerMessage || "",
      },
    });
  },
};
