import { Module } from '@nestjs/common';
import { RefundsController } from './refunds.controller';
import { RefundsService } from './refunds.service';
import { AiModule } from '../ai/ai.module';
import { PolicyModule } from '../policy/policy.module';

@Module({
    imports: [AiModule, PolicyModule],
    controllers: [RefundsController],
    providers: [RefundsService],
    exports: [RefundsService],
})
export class RefundsModule {}
