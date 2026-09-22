import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { PolicyService } from '../policy/policy.service';
import { CreateRefundDto } from './dto/create-refund.dto';
import type { OrderItem } from '@prisma/client';

@Injectable()
export class RefundsService {
    private readonly logger = new Logger(RefundsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly ai: AiService,
        private readonly policy: PolicyService,
    ) {}

    async create(dto: CreateRefundDto) {
        const customer = await this.prisma.customer.findUnique({
            where: { id: dto.customerId },
        });
        if (!customer)
            throw new NotFoundException(`Customer ${dto.customerId} not found`);

        const order = await this.prisma.order.findUnique({
            where: { id: dto.orderId },
            include: { items: true },
        });
        if (!order)
            throw new NotFoundException(`Order ${dto.orderId} not found`);

        if (order.customerId !== dto.customerId) {
            throw new BadRequestException(
                'Order does not belong to this customer',
            );
        }

        const refundRequest = await this.prisma.refundRequest.create({
            data: {
                customerId: dto.customerId,
                orderId: dto.orderId,
                customerMessage: dto.message,
                status: 'PENDING',
            },
        });

        const evaluation = await this.ai.evaluateRefund({
            customerMessage: dto.message,
            customerName: customer.name,
            customerEmail: customer.email,
            orderNumber: order.orderNumber,
            orderTotal: Number(order.totalAmount),
            orderDate: order.createdAt.toISOString(),
            deliveryDate:
                order.status === 'DELIVERED'
                    ? order.updatedAt.toISOString()
                    : null,
            isFinalSale: order.isFinalSale,
            items: order.items.map((item: OrderItem) => ({
                name: item.name,
                quantity: item.quantity,
                unitPrice: Number(item.unitPrice),
                isDamaged: item.isDamaged,
            })),
            policyText: this.policy.getPolicyText(),
        });

        const statusMap = {
            approved: 'APPROVED' as const,
            denied: 'DENIED' as const,
            escalated: 'ESCALATED' as const,
        };

        const updated = await this.prisma.refundRequest.update({
            where: { id: refundRequest.id },
            data: {
                status: statusMap[evaluation.decision],
                aiDecision: evaluation.decision,
                aiReasoning: evaluation.reasoning,
                policyViolations: evaluation.policyViolations,
                confidence: evaluation.confidence,
            },
            include: { customer: true, order: { include: { items: true } } },
        });

        this.logger.log(
            `Refund ${refundRequest.id}: ${evaluation.decision} (confidence: ${evaluation.confidence})`,
        );

        return updated;
    }

    async findAll() {
        return this.prisma.refundRequest.findMany({
            include: { customer: true, order: { include: { items: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const refund = await this.prisma.refundRequest.findUnique({
            where: { id },
            include: { customer: true, order: { include: { items: true } } },
        });
        if (!refund)
            throw new NotFoundException(`Refund request ${id} not found`);
        return refund;
    }
}
