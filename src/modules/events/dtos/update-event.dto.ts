import { IntersectionType, OmitType, PartialType, PickType } from "@nestjs/swagger";

import { EventDto } from "./event.dto";

export class UpdateEventDto extends IntersectionType(
	PickType(EventDto, ["id", "calendarId"]),
	PartialType(OmitType(EventDto, ["googleId", "created", "updated"]))
) {}

export class UpdateEventBodyDto extends OmitType(UpdateEventDto, ["id", "calendarId"]) {}

export class UpdateEventParametersDto extends PickType(UpdateEventDto, ["id", "calendarId"]) {}
