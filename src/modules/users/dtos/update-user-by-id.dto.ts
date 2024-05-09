import { IntersectionType, OmitType, PartialType, PickType } from "@nestjs/swagger";

import { UserDto } from "./user.dto";

export class UpdateUserByIdDto extends IntersectionType(
	PickType(UserDto, ["id"]),
	PickType(PartialType(UserDto), ["name"])
) {}

export class UpdateUserByIdDtoBody extends OmitType(UpdateUserByIdDto, ["id"]) {}
