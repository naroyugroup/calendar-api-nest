import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsISO8601, IsNumber, IsString, IsStrongPassword, IsUrl } from "class-validator";

export class UserDto {
	/** @example 1 */
	@Type(() => Number)
	@IsNumber()
	@ApiProperty({ example: 1 })
	public id: number;

	/** @example "115917002651114023979" */
	@IsString()
	@ApiProperty({ example: "115917002651114023979" })
	public googleId: string;

	/** @example "1//09eu9wffeubu6CgYIARBAGAsSNwF-L7Ir4gsFUX11V1_IiCafopyOI9lUjvDNIP-OE-w9WPiTlRC-N8Zo2WcKYn-PXDT0ysy3-As" */
	@IsString()
	public googleApiRefreshToken: string;

	/** @example "CKT_vJLlzIUDBKC_vJLtzIUDGBUgiKfCxQIoiBfCqQI=" */
	@IsString()
	public googleCalendarSyncToken: string;

	/** @example "test@email.com"*/
	@IsEmail()
	@ApiProperty({ example: "test@email.com" })
	public email: string;

	/** @example "Password5@1" */
	@IsStrongPassword({ minLength: 8, minNumbers: 1, minUppercase: 1, minSymbols: 1 })
	@ApiProperty({
		description: "{ minLength: 8, minNumbers: 1, minUppercase: 1, minSymbols: 1 }",
		example: "Password5@1",
	})
	public password: string;

	/** @example "John Doe" */
	@IsString()
	@ApiProperty({ example: "John Doe" })
	public name: string;

	/** @example "https://dummyimage.com/300"  */
	@IsUrl()
	@ApiProperty({ example: "https://dummyimage.com/300" })
	public picture: string;

	/** @example "2023-02-22T20:48:40.253Z" */
	@IsISO8601()
	@ApiProperty({ description: "ISO 8601", example: "2023-02-22T20:48:40.253Z" })
	public created: string;
}
