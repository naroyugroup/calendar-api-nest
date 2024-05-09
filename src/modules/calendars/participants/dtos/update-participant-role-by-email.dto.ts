import { IntersectionType, PickType } from "@nestjs/swagger";

import { CalendarParticipantDto } from "./calendar-participant.dto";
import { OperateParticipantDto } from "./operate-participant.dto";

export class UpdateParticipantRoleByEmailDto extends IntersectionType(
	OperateParticipantDto,
	PickType(CalendarParticipantDto, ["role"])
) {}

export class UpdateParticipantRoleByEmailBodyDto extends PickType(UpdateParticipantRoleByEmailDto, [
	"email",
	"role",
]) {}
