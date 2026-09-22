/**
 * Wayfinder Action Descriptors for RefundsController
 * Auto-synced from backend/src/refunds/refunds.controller.ts
 */

export const RefundsActions = {
    create: () => ({
        url: '/refunds',
        method: 'POST' as const,
    }),
    store: () => ({
        url: '/refunds',
        method: 'POST' as const,
    }),
    findAll: () => ({
        url: '/refunds',
        method: 'GET' as const,
    }),
    index: () => ({
        url: '/refunds',
        method: 'GET' as const,
    }),
    findOne: (id: string) => ({
        url: `/refunds/${id}`,
        method: 'GET' as const,
    }),
    show: (id: string) => ({
        url: `/refunds/${id}`,
        method: 'GET' as const,
    }),
};
