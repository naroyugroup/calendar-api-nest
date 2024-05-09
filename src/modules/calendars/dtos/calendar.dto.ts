import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsNumber, IsString } from "class-validator";

import { CalendarParticipantDto } from "../participants/dtos/calendar-participant.dto";

export class CalendarDto {
	/** @example 1 */
	@Type(() => Number)
	@IsNumber()
	@ApiProperty({ example: 1 })
	public id: number;

	/** @example "5319799eca23f0e8e4f5bd200c6c884b7109e85231d48c0c0876077693693e5a@group.calendar.google.com" */
	@IsString()
	@ApiProperty({
		example:
			"5319799eca23f0e8e4f5bd200c6c884b7109e85231d48c0c0876077693693e5a@group.calendar.google.com",
	})
	public googleId: string;

	/** @example 1 */
	@Type(() => Number)
	@IsNumber()
	@ApiProperty({ example: 1 })
	public ownerId: number;

	/** @example "My calendar" */
	@IsString()
	@ApiProperty({ example: "My calendar" })
	public summary: string;

	/** @example true */
	@IsBoolean()
	@ApiProperty({ example: true, default: false })
	public favorite: boolean;
}

export class CalendarWithParticipantsDto extends CalendarDto {
	@ApiProperty({ type: [CalendarParticipantDto] })
	public participants: CalendarParticipantDto[];
}
