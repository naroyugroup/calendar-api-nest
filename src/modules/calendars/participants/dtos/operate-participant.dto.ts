import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

import { CalendarParticipantDto } from "./calendar-participant.dto";

export class OperateParticipantDto extends PickType(CalendarParticipantDto, ["calendarId"]) {
	/** @example "test@email.com"*/
	@IsEmail()
	@ApiProperty({ example: "test@email.com" })
	public email: string;
}

export class OperateParticipantParametersDto extends PickType(OperateParticipantDto, [
	"calendarId",
]) {}

export class OperateParticipantBodyDto extends PickType(OperateParticipantDto, ["email"]) {}
