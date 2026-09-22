import { apiRequest } from "../../overrides/axios";
import { CustomersActions } from "../../actions/customers.actions";
import type { Customer } from "../../lib/api";

/**
 * Customers API endpoints invoking Wayfinder action descriptors.
 */
export const customersApi = {
  list: async (): Promise<Customer[]> => {
    return apiRequest<Customer[]>(CustomersActions.index());
  },

  get: async (id: string): Promise<Customer> => {
    return apiRequest<Customer>(CustomersActions.show(id));
  },
};
