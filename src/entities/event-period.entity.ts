import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { EventEntity } from "./event.entity";

@Entity({ name: "event_period" })
export class EventPeriodEntity {
	/** @example 1 */
	@PrimaryGeneratedColumn("identity")
	@ApiProperty({ example: 1 })
	public id: number;

	/** @example "c2a0aaf7-f419-4df8-ba6f-af059bd4f172" */
	@Column({ type: "uuid", name: "event_id" })
	@ApiProperty({ example: "c2a0aaf7-f419-4df8-ba6f-af059bd4f172" })
	public eventId: string;

	@OneToOne(() => EventEntity, (event) => event.period, {
		onDelete: "CASCADE",
	})
	@JoinColumn({ name: "event_id" })
	public event: EventEntity;

	/** @example "2014-10-19" */
	@Column({ type: "date", name: "start_date", nullable: true })
	@ApiProperty({ example: "2014-10-19", required: false })
	public startDate?: Date;

	/** @example "2023-10-10T12:45:00+02:00" */
	@Column({ type: "timestamptz", name: "start_date_time", nullable: true })
	@ApiProperty({ example: "2023-10-10T12:45:00+02:00", required: false })
	public startDateTime?: Date;

	/** @example "Europe/Prague" */
	@Column({ type: "text", name: "start_timezone", nullable: true })
	@ApiProperty({ example: "Europe/Prague", required: false })
	public startTimezone?: string;

	/** @example "2014-10-19" */
	@Column({ type: "date", name: "end_date", nullable: true })
	@ApiProperty({ example: "2014-10-19", required: false })
	public endDate?: Date;

	/** @example "2023-10-10T12:45:00+02:00" */
	@Column({ type: "timestamptz", name: "end_date_time", nullable: true })
	@ApiProperty({ example: "2023-10-10T12:45:00+02:00", required: false })
	public endDateTime?: Date;

	/** @example "Europe/Prague" */
	@Column({ type: "text", name: "end_timezone", nullable: true })
	@ApiProperty({ example: "Europe/Prague", required: false })
	public endTimezone?: string;
}
