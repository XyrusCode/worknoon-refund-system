import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll() {
        return this.prisma.order.findMany({
            include: { items: true, customer: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: { items: true, customer: true },
        });
        if (!order) throw new NotFoundException(`Order ${id} not found`);
        return order;
    }

    async findByCustomer(customerId: string) {
        return this.prisma.order.findMany({
            where: { customerId },
            include: { items: true },
            orderBy: { createdAt: 'desc' },
        });
    }
}
