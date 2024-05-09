import { PickType } from "@nestjs/swagger";

import { EventDto } from "./event.dto";

export class OperateEventDto extends PickType(EventDto, ["id", "calendarId"]) {}
