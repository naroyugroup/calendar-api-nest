import { IntersectionType, PartialType, PickType } from "@nestjs/swagger";

import { UserDto } from "./user.dto";

export class CreateUserDto extends IntersectionType(
	PickType(UserDto, ["email", "name"]),
	PickType(PartialType(UserDto), ["password", "picture"])
) {}
