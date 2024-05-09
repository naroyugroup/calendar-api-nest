import { IntersectionType, PickType } from "@nestjs/swagger";

import { UserDto } from "src/modules/users/dtos/user.dto";

import { AdditionalInformationDto } from "./additional-information.dto";

export class LoginUserBodyDto extends PickType(UserDto, ["email", "password"]) {}

export class LoginUserDto extends IntersectionType(LoginUserBodyDto, AdditionalInformationDto) {}
