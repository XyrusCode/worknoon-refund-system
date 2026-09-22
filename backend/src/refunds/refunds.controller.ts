import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RefundsService } from './refunds.service';
import { CreateRefundDto } from './dto/create-refund.dto';

@ApiTags('refunds')
@Controller('refunds')
export class RefundsController {
    constructor(private readonly refundsService: RefundsService) {}

    @Post()
    @ApiOperation({
        summary: 'Submit a refund request (triggers AI evaluation)',
    })
    create(@Body() dto: CreateRefundDto) {
        return this.refundsService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'List all refund requests (admin dashboard)' })
    findAll() {
        return this.refundsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get refund request with full reasoning' })
    findOne(@Param('id') id: string) {
        return this.refundsService.findOne(id);
    }
}
