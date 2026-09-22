import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRefundDto {
    @ApiProperty({ example: 'cust_001', description: 'Customer ID' })
    @IsString()
    @IsNotEmpty()
    customerId!: string;

    @ApiProperty({ example: 'ord_001', description: 'Order ID' })
    @IsString()
    @IsNotEmpty()
    orderId!: string;

    @ApiProperty({
        example: 'Item arrived damaged, the box was crushed during shipping.',
        description: 'Customer explanation for the refund request',
    })
    @IsString()
    @IsNotEmpty()
    message!: string;
}
