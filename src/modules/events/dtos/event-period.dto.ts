import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsISO8601, IsTimeZone, IsNumber, IsUUID } from "class-validator";

export class EventPeriodDto {
	/** @example 1 */
	@Type(() => Number)
	@IsNumber()
	@ApiProperty({ example: 1 })
	public id: number;

	/** @example "c2a0aaf7-f419-4df8-ba6f-af059bd4f172" */
	@IsUUID()
	@ApiProperty({ example: "c2a0aaf7-f419-4df8-ba6f-af059bd4f172" })
	public eventId: string;

	/** @example "2014-10-19" */
	@IsISO8601()
	@ApiProperty({ description: "ISO 8601 only date", example: "2014-10-19" })
	public startDate: string;

	/** @example "2023-10-10T12:45:00+02:00" */
	@IsISO8601()
	@ApiProperty({ description: "ISO 8601", example: "2023-02-22T20:48:40.253Z" })
	public startDateTime: string;

	/** IANA Timezone @example "Europe/Prague" */
	@IsTimeZone()
	@ApiProperty({ description: "IANA Timezone", example: "Europe/Prague" })
	public startTimezone: string;

	/** @example "2014-10-19" */
	@IsISO8601()
	@ApiProperty({ description: "ISO 8601 only date", example: "2014-10-19" })
	public endDate: string;

	/** @example "2023-10-10T12:45:00+02:00" */
	@IsISO8601()
	@ApiProperty({ description: "ISO 8601", example: "2023-02-22T20:48:40.253Z" })
	public endDateTime: string;

	/** IANA Timezone @example "Europe/Prague" */
	@IsTimeZone()
	@ApiProperty({ description: "IANA Timezone", example: "Europe/Prague" })
	public endTimezone: string;
}
