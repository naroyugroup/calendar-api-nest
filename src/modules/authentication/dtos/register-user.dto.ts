import { IntersectionType, PickType } from "@nestjs/swagger";

import { UserDto } from "src/modules/users/dtos/user.dto";

import { AdditionalInformationDto } from "./additional-information.dto";

export class RegisterUserBodyDto extends PickType(UserDto, ["email", "password", "name"]) {}

export class RegisterUserDto extends IntersectionType(
	RegisterUserBodyDto,
	AdditionalInformationDto
) {}
