import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class AdditionalInformationDto {
	/** @example "Mozilla/5.0 (X11; Linux x86_64; rv:126.0) Gecko/20100101 Firefox/126.0" */
	@IsString()
	@ApiProperty({
		example: "Mozilla/5.0 (X11; Linux x86_64; rv:126.0) Gecko/20100101 Firefox/126.0",
	})
	public userAgent: string;
}
