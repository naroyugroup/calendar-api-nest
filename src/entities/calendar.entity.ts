import { ApiProperty } from "@nestjs/swagger";
import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from "typeorm";

import { UserEntity } from "./user.entity";

@Entity({ name: "calendar" })
export class CalendarEntity {
	/** @example 1 */
	@PrimaryGeneratedColumn("identity")
	@ApiProperty({ example: 1 })
	public id: number;

	/** @example "5319799eca23f0e8e4f5bd200c6c884b7109e85231d48c0c0876077693693e5a@group.calendar.google.com" */
	@Column({ type: "text", name: "google_id", nullable: true })
	@ApiProperty({
		example:
			"5319799eca23f0e8e4f5bd200c6c884b7109e85231d48c0c0876077693693e5a@group.calendar.google.com",
		required: false,
	})
	public googleId?: string;

	/** @example 1 */
	@Column({ type: "int", name: "owner_id", unsigned: true })
	@ApiProperty({ example: 1 })
	public ownerId: number;

	@ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
	@JoinColumn({ name: "owner_id" })
	public owner: UserEntity;

	/** @example "My calendar" */
	@Column({ type: "text", nullable: false })
	@ApiProperty({ example: "My calendar" })
	public summary: string;

	/** @example true */
	@Column({ type: "bool", default: false })
	@ApiProperty({ example: true, default: false })
	public favorite: boolean;
}
