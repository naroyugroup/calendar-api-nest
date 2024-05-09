import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional } from "class-validator";

import { ParticipantRole } from "src/entities/calendar-participant.entity";

export class CalendarParticipantDto {
	/** @example 1 */
	@Type(() => Number)
	@IsNumber()
	@ApiProperty({ example: 1 })
	public id: number;

	/** @example 1 */
	@Type(() => Number)
	@IsNumber()
	@ApiProperty({ example: 1 })
	public calendarId: number;

	/** @example 1 */
	@Type(() => Number)
	@IsNumber()
	@ApiProperty({ example: 1 })
	public userId: number;

	/** @example "member" */
	@IsOptional()
	@IsEnum(ParticipantRole)
	@ApiProperty({
		type: ParticipantRole,
		enum: ParticipantRole,
		example: ParticipantRole.MEMBER,
		default: ParticipantRole.MEMBER,
	})
	public role: ParticipantRole;
}
