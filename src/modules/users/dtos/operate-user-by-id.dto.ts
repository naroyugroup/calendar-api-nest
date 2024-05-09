import { PickType } from "@nestjs/swagger";

import { UserDto } from "./user.dto";

export class OperateUserByIdDto extends PickType(UserDto, ["id"]) {}
