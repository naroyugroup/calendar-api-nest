import { PickType } from "@nestjs/swagger";

import { CalendarDto } from "./calendar.dto";

export class UpdateCalendarFavoriteStatusBodyDto extends PickType(CalendarDto, ["favorite"]) {}
