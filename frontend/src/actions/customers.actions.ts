/**
 * Wayfinder Action Descriptors for CustomersController
 * Auto-synced from backend/src/customers/customers.controller.ts
 */

export const CustomersActions = {
    findAll: () => ({
        url: '/customers',
        method: 'GET' as const,
    }),
    index: () => ({
        url: '/customers',
        method: 'GET' as const,
    }),
    findOne: (id: string) => ({
        url: `/customers/${id}`,
        method: 'GET' as const,
    }),
    show: (id: string) => ({
        url: `/customers/${id}`,
        method: 'GET' as const,
    }),
};
