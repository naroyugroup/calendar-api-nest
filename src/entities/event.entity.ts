import { ApiProperty } from "@nestjs/swagger";
import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";

import { CalendarEntity } from "./calendar.entity";
import { EventPeriodEntity } from "./event-period.entity";

@Entity({ name: "event" })
export class EventEntity {
	/** @example "c2a0aaf7-f419-4df8-ba6f-af059bd4f172" */
	@PrimaryGeneratedColumn("uuid")
	@ApiProperty({ example: "c2a0aaf7-f419-4df8-ba6f-af059bd4f172" })
	public id: string;

	/** @example "5t4mjrqatiqvlr3infgco2785g" */
	@Column({ type: "text", name: "google_id", nullable: true })
	@ApiProperty({ example: "5t4mjrqatiqvlr3infgco2785g", required: false })
	public googleId?: string;

	/** @example 1 */
	@Column({ type: "int", name: "calendar_id", unsigned: true })
	@ApiProperty({ example: 1 })
	public calendarId: number;

	@ManyToOne(() => CalendarEntity, { onDelete: "CASCADE" })
	@JoinColumn({ name: "calendar_id" })
	public calendar: CalendarEntity;

	@OneToOne(() => EventPeriodEntity, (period) => period.event, {
		eager: true,
		cascade: ["insert", "update", "remove"],
	})
	@ApiProperty({ type: () => EventPeriodEntity })
	public period: EventPeriodEntity;

	/** @example "My event" */
	@Column({ type: "text" })
	@ApiProperty({ example: "My event" })
	public summary: string;

	/** @example "Event description" */
	@Column({ type: "text", nullable: true })
	@ApiProperty({ example: "Event description", required: false })
	public description?: string;

	/** @example "Event location" */
	@Column({ type: "text", nullable: true })
	@ApiProperty({ example: "Event location", required: false })
	public location?: string;

	/**
	 * RFC 5545 RRULE
	 * @example RRULE:FREQ=YEARLY;WKST=MO;INTERVAL=1;BYMONTH=7;BYMONTHDAY=23
	 */
	@Column({ type: "text", name: "recurrence_rule", nullable: true })
	@ApiProperty({
		description: "RFC 5545 RRULE",
		example: "RRULE:FREQ=YEARLY;WKST=MO;INTERVAL=1;BYMONTH=7;BYMONTHDAY=23",
		required: false,
	})
	public recurrenceRule?: string;

	/** @example "test@email.com"*/
	@Column({ type: "text" })
	@ApiProperty({ example: "test@email.com" })
	public creator: string;

	/** @example "test@email.com"*/
	@Column({ type: "text" })
	@ApiProperty({ example: "test@email.com" })
	public organizer: string;

	/** @example ["test@email.com", "test1@email.com"] */
	@Column({ type: "text", array: true, nullable: true })
	@ApiProperty({ example: ["test@email.com", "test1@email.com"], required: false })
	public attendee?: string[];

	/** @example "2023-02-22T20:48:40.253Z" */
	@CreateDateColumn({
		type: "timestamp with time zone",
		default: () => "CURRENT_TIMESTAMP",
	})
	@ApiProperty({ example: "2023-02-22T20:48:40.253Z" })
	public created: Date;

	/** @example "2023-02-22T20:48:40.253Z" */
	@UpdateDateColumn({
		type: "timestamp with time zone",
		default: () => "CURRENT_TIMESTAMP",
	})
	@ApiProperty({ example: "2023-02-22T20:48:40.253Z" })
	public updated: Date;
}
