import { IntersectionType, OmitType, PickType } from "@nestjs/swagger";

import { UserDto } from "src/modules/users/dtos/user.dto";

import { CalendarParticipantDto } from "./calendar-participant.dto";

export class GetAllCalendarParticipantsResultDto extends IntersectionType(
	OmitType(UserDto, ["googleApiRefreshToken", "googleCalendarSyncToken", "password"]),
	PickType(CalendarParticipantDto, ["role"])
) {}
