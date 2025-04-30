import { BaseDto } from "@/common/dtos/base.dto";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class PushSubscriptionDto extends PartialType(BaseDto) {
    @ApiProperty({ description: 'Name of the push-subscription' })
    @IsNotEmpty()
    @IsString()
    name!: string;
    
    // Add your DTO fields here
}

export class UpdatePushSubscriptionDto extends PartialType(PushSubscriptionDto) {}

export class GetPushSubscriptionDto extends createGetDto(UpdatePushSubscriptionDto, 'push subscription') {}