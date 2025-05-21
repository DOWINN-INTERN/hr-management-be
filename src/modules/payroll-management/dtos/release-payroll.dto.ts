import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReleasePayrollDto {
    @ApiProperty({
        description: 'Payment method type',
        example: 'BANK_TRANSFER',
        enum: ['BANK_TRANSFER', 'CHECK', 'CASH']
    })
    @IsString()
    @IsNotEmpty()
    paymentMethod!: string;

    @ApiProperty({
        description: 'Date when the payment was released',
        example: '2023-04-15T00:00:00Z'
    })
    @IsDate()
    @IsNotEmpty()
    paymentDate!: Date;

    @ApiPropertyOptional({
        description: 'Reference number provided by the bank for the transaction',
        example: 'TX12345678'
    })
    @IsString()
    @IsOptional()
    bankReferenceNumber?: string;

    @ApiPropertyOptional({
        description: 'Bank account number for bank transfers',
        example: '****4567'
    })
    @IsString()
    @IsOptional()
    bankAccount?: string;

    @ApiPropertyOptional({
        description: 'Check number for check payments',
        example: '10024'
    })
    @IsString()
    @IsOptional()
    checkNumber?: string;
}