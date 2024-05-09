import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "user" })
export class UserEntity {
	/** @example 1 */
	@PrimaryGeneratedColumn("identity")
	@ApiProperty({ example: 1 })
	public id: number;

	/** @example "115917002651114023979" */
	@Column({ type: "text", name: "google_id", nullable: true })
	@ApiProperty({ example: "115917002651114023979", required: false })
	public googleId: string;

	/** @example "1//09eu9wffeubu6CgYIARBAGAsSNwF-L7Ir4gsFUX11V1_IiCafopyOI9lUjvDNIP-OE-w9WPiTlRC-N8Zo2WcKYn-PXDT0ysy3-As" */
	@Column({ type: "text", name: "google_api_refresh_token", nullable: true })
	public googleApiRefreshToken?: string;

	/** @example "CKT_vJLlzIUDBKC_vJLtzIUDGBUgiKfCxQIoiBfCqQI=" */
	@Column({ type: "text", name: "google_calendar_sync_token", nullable: true })
	public googleCalendarSyncToken?: string;

	/** @example "test@email.com"*/
	@Column({ type: "text", unique: true })
	@ApiProperty({ example: "test@email.com" })
	public email: string;

	/** @example "Password5@1" */
	@Column({ type: "text", nullable: true })
	public password?: string;

	/** @example "John Doe" */
	@Column({ type: "text" })
	@ApiProperty({ example: "John Doe" })
	public name: string;

	/** @example "https://dummyimage.com/300"  */
	@Column({ type: "text", nullable: true })
	@ApiProperty({ example: "https://dummyimage.com/300" })
	public picture?: string;

	/** @example "2023-02-22T20:48:40.253Z" */
	@CreateDateColumn({
		type: "timestamp with time zone",
		default: () => "CURRENT_TIMESTAMP",
		name: "created",
	})
	@ApiProperty({ example: "2023-02-22T20:48:40.253Z" })
	public created: Date;
}
