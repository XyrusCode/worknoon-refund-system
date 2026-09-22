import { PrismaClient, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

const customers = [
    { id: 'cust_001', name: 'Sarah Chen', email: 'sarah.chen@example.com', phone: '+1-555-0101' },
    { id: 'cust_002', name: 'Marcus Johnson', email: 'marcus.j@example.com', phone: '+1-555-0102' },
    { id: 'cust_003', name: 'Priya Patel', email: 'priya.p@example.com', phone: '+1-555-0103' },
    { id: 'cust_004', name: 'James O\'Brien', email: 'james.ob@example.com', phone: '+1-555-0104' },
    { id: 'cust_005', name: 'Aisha Rahman', email: 'aisha.r@example.com', phone: '+1-555-0105' },
    { id: 'cust_006', name: 'David Kim', email: 'david.kim@example.com', phone: '+1-555-0106' },
    { id: 'cust_007', name: 'Elena Volkov', email: 'elena.v@example.com', phone: '+1-555-0107' },
    { id: 'cust_008', name: 'Carlos Mendez', email: 'carlos.m@example.com', phone: '+1-555-0108' },
    { id: 'cust_009', name: 'Fatima Al-Hassan', email: 'fatima.h@example.com', phone: '+1-555-0109' },
    { id: 'cust_010', name: 'Ryan Murphy', email: 'ryan.m@example.com', phone: '+1-555-0110' },
    { id: 'cust_011', name: 'Yuki Tanaka', email: 'yuki.t@example.com', phone: '+1-555-0111' },
    { id: 'cust_012', name: 'Olivia Barnes', email: 'olivia.b@example.com', phone: '+1-555-0112' },
    { id: 'cust_013', name: 'Ahmed Hassan', email: 'ahmed.h@example.com', phone: '+1-555-0113' },
    { id: 'cust_014', name: 'Lisa Wang', email: 'lisa.w@example.com', phone: '+1-555-0114' },
    { id: 'cust_015', name: 'Tom Bradley', email: 'tom.b@example.com', phone: '+1-555-0115' },
];

function daysAgo(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
}

const orders = [
    // cust_001 - Recent order, eligible
    {
        id: 'ord_001', orderNumber: 'WN-2026-001', customerId: 'cust_001',
        totalAmount: 89.99, status: 'DELIVERED' as OrderStatus, isFinalSale: false,
        createdAt: daysAgo(10), updatedAt: daysAgo(8),
        items: [
            { name: 'Wireless Bluetooth Earbuds', quantity: 1, unitPrice: 89.99, isDamaged: false },
        ],
    },
    // cust_002 - Damaged item, eligible for approval
    {
        id: 'ord_002', orderNumber: 'WN-2026-002', customerId: 'cust_002',
        totalAmount: 249.50, status: 'DELIVERED' as OrderStatus, isFinalSale: false,
        createdAt: daysAgo(5), updatedAt: daysAgo(3),
        items: [
            { name: 'Ergonomic Office Chair', quantity: 1, unitPrice: 249.50, isDamaged: true },
        ],
    },
    // cust_003 - Final sale item, denied
    {
        id: 'ord_003', orderNumber: 'WN-2026-003', customerId: 'cust_003',
        totalAmount: 199.00, status: 'DELIVERED' as OrderStatus, isFinalSale: true,
        createdAt: daysAgo(7), updatedAt: daysAgo(5),
        items: [
            { name: 'Limited Edition Sneakers', quantity: 1, unitPrice: 199.00, isDamaged: false },
        ],
    },
    // cust_004 - Old order, denied (>30 days)
    {
        id: 'ord_004', orderNumber: 'WN-2026-004', customerId: 'cust_004',
        totalAmount: 45.00, status: 'DELIVERED' as OrderStatus, isFinalSale: false,
        createdAt: daysAgo(45), updatedAt: daysAgo(42),
        items: [
            { name: 'USB-C Charging Cable', quantity: 2, unitPrice: 22.50, isDamaged: false },
        ],
    },
    // cust_005 - High value, escalated
    {
        id: 'ord_005', orderNumber: 'WN-2026-005', customerId: 'cust_005',
        totalAmount: 750.00, status: 'DELIVERED' as OrderStatus, isFinalSale: false,
        createdAt: daysAgo(12), updatedAt: daysAgo(10),
        items: [
            { name: '4K Monitor 27"', quantity: 1, unitPrice: 599.00, isDamaged: false },
            { name: 'Monitor Stand', quantity: 1, unitPrice: 151.00, isDamaged: false },
        ],
    },
    // cust_006 - Multiple items, one damaged
    {
        id: 'ord_006', orderNumber: 'WN-2026-006', customerId: 'cust_006',
        totalAmount: 156.00, status: 'DELIVERED' as OrderStatus, isFinalSale: false,
        createdAt: daysAgo(14), updatedAt: daysAgo(12),
        items: [
            { name: 'Mechanical Keyboard', quantity: 1, unitPrice: 120.00, isDamaged: false },
            { name: 'Keyboard Wrist Rest', quantity: 1, unitPrice: 36.00, isDamaged: true },
        ],
    },
    // cust_007 - Recently shipped, not delivered yet
    {
        id: 'ord_007', orderNumber: 'WN-2026-007', customerId: 'cust_007',
        totalAmount: 329.99, status: 'SHIPPED' as OrderStatus, isFinalSale: false,
        createdAt: daysAgo(3), updatedAt: daysAgo(2),
        items: [
            { name: 'Smart Home Hub', quantity: 1, unitPrice: 329.99, isDamaged: false },
        ],
    },
    // cust_008 - Small order, straightforward
    {
        id: 'ord_008', orderNumber: 'WN-2026-008', customerId: 'cust_008',
        totalAmount: 29.99, status: 'DELIVERED' as OrderStatus, isFinalSale: false,
        createdAt: daysAgo(20), updatedAt: daysAgo(18),
        items: [
            { name: 'Phone Case - Clear', quantity: 1, unitPrice: 29.99, isDamaged: false },
        ],
    },
    // cust_009 - Final sale, high value, denied
    {
        id: 'ord_009', orderNumber: 'WN-2026-009', customerId: 'cust_009',
        totalAmount: 899.00, status: 'DELIVERED' as OrderStatus, isFinalSale: true,
        createdAt: daysAgo(8), updatedAt: daysAgo(6),
        items: [
            { name: 'Designer Handbag', quantity: 1, unitPrice: 899.00, isDamaged: false },
        ],
    },
    // cust_010 - Cancelled order
    {
        id: 'ord_010', orderNumber: 'WN-2026-010', customerId: 'cust_010',
        totalAmount: 175.00, status: 'CANCELLED' as OrderStatus, isFinalSale: false,
        createdAt: daysAgo(25), updatedAt: daysAgo(20),
        items: [
            { name: 'Portable Bluetooth Speaker', quantity: 1, unitPrice: 175.00, isDamaged: false },
        ],
    },
    // cust_011 - Recent, perfect condition
    {
        id: 'ord_011', orderNumber: 'WN-2026-011', customerId: 'cust_011',
        totalAmount: 59.99, status: 'DELIVERED' as OrderStatus, isFinalSale: false,
        createdAt: daysAgo(6), updatedAt: daysAgo(4),
        items: [
            { name: 'Wireless Mouse', quantity: 1, unitPrice: 59.99, isDamaged: false },
        ],
    },
    // cust_012 - Multiple items, all fine
    {
        id: 'ord_012', orderNumber: 'WN-2026-012', customerId: 'cust_012',
        totalAmount: 210.00, status: 'DELIVERED' as OrderStatus, isFinalSale: false,
        createdAt: daysAgo(15), updatedAt: daysAgo(13),
        items: [
            { name: 'Yoga Mat', quantity: 1, unitPrice: 65.00, isDamaged: false },
            { name: 'Resistance Bands Set', quantity: 1, unitPrice: 45.00, isDamaged: false },
            { name: 'Water Bottle 32oz', quantity: 2, unitPrice: 50.00, isDamaged: false },
        ],
    },
    // cust_013 - Edge case: exactly at 30 days
    {
        id: 'ord_013', orderNumber: 'WN-2026-013', customerId: 'cust_013',
        totalAmount: 134.50, status: 'DELIVERED' as OrderStatus, isFinalSale: false,
        createdAt: daysAgo(30), updatedAt: daysAgo(30),
        items: [
            { name: 'Coffee Maker', quantity: 1, unitPrice: 134.50, isDamaged: false },
        ],
    },
    // cust_014 - Correct item claim
    {
        id: 'ord_014', orderNumber: 'WN-2026-014', customerId: 'cust_014',
        totalAmount: 425.00, status: 'DELIVERED' as OrderStatus, isFinalSale: false,
        createdAt: daysAgo(9), updatedAt: daysAgo(7),
        items: [
            { name: 'Running Shoes - Size 8', quantity: 1, unitPrice: 175.00, isDamaged: false },
            { name: 'Running Shorts', quantity: 1, unitPrice: 55.00, isDamaged: false },
            { name: 'Sports Watch', quantity: 1, unitPrice: 195.00, isDamaged: false },
        ],
    },
    // cust_015 - Already returned
    {
        id: 'ord_015', orderNumber: 'WN-2026-015', customerId: 'cust_015',
        totalAmount: 88.00, status: 'RETURNED' as OrderStatus, isFinalSale: false,
        createdAt: daysAgo(18), updatedAt: daysAgo(5),
        items: [
            { name: 'Desk Lamp', quantity: 1, unitPrice: 88.00, isDamaged: false },
        ],
    },
];

async function main() {
    console.log('Seeding database...');

    for (const customer of customers) {
        await prisma.customer.upsert({
            where: { id: customer.id },
            update: {},
            create: customer,
        });
    }
    console.log(`Seeded ${customers.length} customers`);

    for (const order of orders) {
        const { items, ...orderData } = order;
        await prisma.order.upsert({
            where: { id: order.id },
            update: {},
            create: {
                ...orderData,
                items: {
                    create: items,
                },
            },
        });
    }
    console.log(`Seeded ${orders.length} orders with items`);

    console.log('Seed complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
