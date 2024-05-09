import { IntersectionType, OmitType, PartialType, PickType } from "@nestjs/swagger";

import { EventDto } from "./event.dto";

export class CreateEventDto extends IntersectionType(
	OmitType(EventDto, [
		"id",
		"googleId",
		"created",
		"updated",
		"recurrenceRule",
		"location",
		"description",
		"attendee",
	]),
	PickType(PartialType(EventDto), ["recurrenceRule", "location", "description", "attendee"])
) {}

export class CreateEventParametersDto extends PickType(CreateEventDto, ["calendarId"]) {}

export class CreateEventBodyDto extends OmitType(CreateEventDto, ["calendarId"]) {}
