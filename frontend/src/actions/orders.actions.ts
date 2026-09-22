/**
 * Wayfinder Action Descriptors for OrdersController
 * Auto-synced from backend/src/orders/orders.controller.ts
 */

export const OrdersActions = {
    findAll: () => ({
        url: '/orders',
        method: 'GET' as const,
    }),
    index: () => ({
        url: '/orders',
        method: 'GET' as const,
    }),
    findOne: (id: string) => ({
        url: `/orders/${id}`,
        method: 'GET' as const,
    }),
    show: (id: string) => ({
        url: `/orders/${id}`,
        method: 'GET' as const,
    }),
    findByCustomer: (customerId: string) => ({
        url: `/orders/customer/${customerId}`,
        method: 'GET' as const,
    }),
    byCustomer: (customerId: string) => ({
        url: `/orders/customer/${customerId}`,
        method: 'GET' as const,
    }),
};
