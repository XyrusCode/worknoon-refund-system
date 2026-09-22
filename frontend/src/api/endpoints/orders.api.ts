import { apiRequest } from "../../overrides/axios";
import { OrdersActions } from "../../actions/orders.actions";
import type { Order } from "../../lib/api";

/**
 * Orders API endpoints invoking Wayfinder action descriptors.
 */
export const ordersApi = {
  list: async (): Promise<Order[]> => {
    return apiRequest<Order[]>(OrdersActions.index());
  },

  get: async (id: string): Promise<Order> => {
    return apiRequest<Order>(OrdersActions.show(id));
  },

  byCustomer: async (customerId: string): Promise<Order[]> => {
    return apiRequest<Order[]>(OrdersActions.byCustomer(customerId));
  },
};
