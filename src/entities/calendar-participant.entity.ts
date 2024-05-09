import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { CalendarEntity } from "./calendar.entity";
import { UserEntity } from "./user.entity";

export enum ParticipantRole {
	MEMBER = "member",
	ADMIN = "admin",
	OWNER = "owner",
}

@Entity({ name: "calendar_participant" })
export class CalendarParticipantEntity {
	/** @example 1 */
	@PrimaryGeneratedColumn("identity")
	@ApiProperty({ example: 1 })
	public id: number;

	/** @example 1 */
	@Column({ type: "int", name: "calendar_id", unsigned: true })
	@ApiProperty({ example: 1 })
	public calendarId: number;

	@ManyToOne(() => CalendarEntity, { onDelete: "CASCADE" })
	@JoinColumn({ name: "calendar_id" })
	public calendar: CalendarEntity;

	/** @example 1 */
	@Column({ type: "int", name: "user_id", unsigned: true })
	@ApiProperty({ example: 1 })
	public userId: number;

	@ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
	@JoinColumn({ name: "user_id" })
	public user: UserEntity;

	/** @example "member" */
	@Column({
		type: "enum",
		enum: ParticipantRole,
		enumName: "participant_role",
		default: ParticipantRole.MEMBER,
	})
	@ApiProperty({
		type: ParticipantRole,
		enum: ParticipantRole,
		example: ParticipantRole.MEMBER,
		default: ParticipantRole.MEMBER,
	})
	public role: ParticipantRole;

	/** @example true */
	@Column({ type: "bool", default: false })
	@ApiProperty({ example: true, default: false })
	public favorite: boolean;
}
