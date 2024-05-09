import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber } from "class-validator";

export class AuthenticationInformationDto {
	/** @example 1 */
	@Type(() => Number)
	@IsNumber()
	@ApiProperty({ example: 1 })
	public ownerId: number;
}
