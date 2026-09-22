import './common/env';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { CustomersModule } from './customers/customers.module';
import { OrdersModule } from './orders/orders.module';
import { RefundsModule } from './refunds/refunds.module';
import { PolicyModule } from './policy/policy.module';
import { AiModule } from './ai/ai.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        PolicyModule,
        AiModule,
        CustomersModule,
        OrdersModule,
        RefundsModule,
    ],
    controllers: [AppController],
})
export class AppModule {}
