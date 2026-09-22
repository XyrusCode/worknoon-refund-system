import { z } from 'zod';

export const refundDecisionSchema = z.object({
    decision: z.enum(['approved', 'denied', 'escalated']),
    reasoning: z
        .string()
        .describe(
            'Clear explanation of why this decision was made, referencing specific policy rules',
        ),
    policyViolations: z
        .array(z.string())
        .describe('List of policy rules violated, if any'),
    confidence: z
        .number()
        .min(0)
        .max(1)
        .describe('Confidence in the decision, 0 to 1'),
});

export type RefundDecision = z.infer<typeof refundDecisionSchema>;

export interface RefundEvaluationContext {
    customerMessage: string;
    customerName: string;
    customerEmail: string;
    orderNumber: string;
    orderTotal: number;
    orderDate: string;
    deliveryDate: string | null;
    isFinalSale: boolean;
    items: Array<{
        name: string;
        quantity: number;
        unitPrice: number;
        isDamaged: boolean;
    }>;
    policyText: string;
}
