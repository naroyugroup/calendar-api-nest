import { ApiProperty, IntersectionType, PickType } from "@nestjs/swagger";
import { IsArray, IsEmail } from "class-validator";

import { EventEntity } from "src/entities/event.entity";

export class AddParticipantsByEmailBodyDto {
	/** @example ["test@email.com", "test1@email.com"] */
	@IsArray()
	@IsEmail({}, { each: true })
	@ApiProperty({ example: ["test@email.com", "test1@email.com"] })
	public participants: string[];
}

export class AddParticipantsByEmailDto extends IntersectionType(
	PickType(EventEntity, ["calendarId"]),
	AddParticipantsByEmailBodyDto
) {}

export class AddParticipantsByEmailParameters extends PickType(AddParticipantsByEmailDto, [
	"calendarId",
]) {}
