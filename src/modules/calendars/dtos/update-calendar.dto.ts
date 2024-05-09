import { IntersectionType, PartialType, PickType } from "@nestjs/swagger";

import { CalendarDto } from "./calendar.dto";

export class UpdateCalendarDto extends IntersectionType(
	PickType(CalendarDto, ["id", "ownerId"]),
	PickType(PartialType(CalendarDto), ["summary"])
) {}

export class UpdateCalendarBodyDto extends PickType(UpdateCalendarDto, ["summary"]) {}
