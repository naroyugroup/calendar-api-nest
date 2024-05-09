import { IntersectionType, OmitType, PartialType, PickType } from "@nestjs/swagger";

import { UserDto } from "./user.dto";

export class UpdateUserPasswordByIdDto extends IntersectionType(
	PickType(UserDto, ["id"]),
	PickType(PartialType(UserDto), ["password"])
) {}

export class UpdateUserPasswordByIdDtoBody extends OmitType(UpdateUserPasswordByIdDto, ["id"]) {}
