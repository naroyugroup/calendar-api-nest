import { IntersectionType, OmitType, PartialType, PickType } from "@nestjs/swagger";

import { CalendarDto } from "./calendar.dto";

export class CreateCalendarDto extends IntersectionType(
	OmitType(CalendarDto, ["id", "googleId", "favorite"]),
	PickType(PartialType(CalendarDto), ["favorite"])
) {}

export class CreateCalendarBodyDto extends OmitType(CreateCalendarDto, ["ownerId"]) {}
