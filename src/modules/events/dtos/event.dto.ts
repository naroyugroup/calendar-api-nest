import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
	IsArray,
	IsEmail,
	IsISO8601,
	IsNumber,
	IsString,
	IsUUID,
	ValidateNested,
} from "class-validator";

import { EventPeriodDto } from "./event-period.dto";

class EventPeriodInternalDto extends OmitType(PartialType(EventPeriodDto), ["id", "eventId"]) {}

export class EventDto {
	/** @example "c2a0aaf7-f419-4df8-ba6f-af059bd4f172" */
	@IsUUID()
	@ApiProperty({ example: "c2a0aaf7-f419-4df8-ba6f-af059bd4f172" })
	public id: string;

	/** @example "5t4mjrqatiqvlr3infgco2785g" */
	@IsString()
	@ApiProperty({ example: "5t4mjrqatiqvlr3infgco2785g" })
	public googleId?: string;

	/** @example 1 */
	@Type(() => Number)
	@IsNumber()
	@ApiProperty({ example: 1 })
	public calendarId: number;

	@ValidateNested()
	@Type(() => EventPeriodInternalDto)
	@ApiProperty({ type: EventPeriodInternalDto })
	public period: EventPeriodInternalDto;

	/** @example "My event" */
	@IsString()
	@ApiProperty({ example: "My event" })
	public summary: string;

	/** @example "Event description" */
	@IsString()
	@ApiProperty({ example: "Event description" })
	public description: string;

	/** @example "Event location" */
	@IsString()
	@ApiProperty({ example: "Event location" })
	public location: string;

	/**
	 * RFC 5545 RRULE
	 * @example RRULE:FREQ=YEARLY;WKST=MO;INTERVAL=1;BYMONTH=7;BYMONTHDAY=23
	 */
	@IsString()
	@ApiProperty({
		description: "RFC 5545 RRULE",
		example: "RRULE:FREQ=YEARLY;WKST=MO;INTERVAL=1;BYMONTH=7;BYMONTHDAY=23",
	})
	public recurrenceRule: string;

	/** @example "test@email.com"*/
	@IsEmail()
	@ApiProperty({ example: "test@email.com" })
	public creator: string;

	/** @example "test@email.com"*/
	@IsEmail()
	@ApiProperty({ example: "test@email.com" })
	public organizer: string;

	/** @example ["test@email.com", "test1@email.com"] */
	@IsArray()
	@IsEmail({}, { each: true })
	@ApiProperty({ example: ["test@email.com", "test1@email.com"] })
	public attendee: string[];

	/** @example "2023-02-22T20:48:40.253Z" */
	@IsISO8601()
	@ApiProperty({ description: "ISO 8601", example: "2023-02-22T20:48:40.253Z" })
	public created: string;

	/** @example "2023-02-22T20:48:40.253Z" */
	@IsISO8601()
	@ApiProperty({ description: "ISO 8601", example: "2023-02-22T20:48:40.253Z" })
	public updated: string;
}
