import { ApiProperty, IntersectionType, PickType } from "@nestjs/swagger";
import { IsISO8601 } from "class-validator";

import { EventDto } from "./event.dto";

export class GetEventsByDateRangeQueryDto {
	/** @example "2014-10-19" */
	@IsISO8601()
	@ApiProperty({ description: "ISO 8601 only date", example: "2014-10-19" })
	public startDate: string;

	/** @example "2014-10-19" */
	@IsISO8601()
	@ApiProperty({ description: "ISO 8601 only date", example: "2014-10-19" })
	public endDate: string;
}

export class GetEventsByDateRangeParametersDto extends PickType(EventDto, ["calendarId"]) {}

export class GetEventsByDateRangeDto extends IntersectionType(
	GetEventsByDateRangeQueryDto,
	GetEventsByDateRangeParametersDto
) {}
