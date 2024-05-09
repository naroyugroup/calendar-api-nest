import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { typeOrmConfigBase } from "src/database/ormconfig";
import { CalendarEntity } from "src/entities/calendar.entity";

import { CalendarsController } from "./calendars.controller";
import { CalendarsRepository } from "./calendars.repository";
import { CalendarParticipantsModule } from "./participants/calendar-participants.module";
import { AuthenticationModule } from "../authentication/authentication.module";
import { GoogleCalendarModule } from "../google-calendar/google-calendar.module";

@Module({
	imports: [
		TypeOrmModule.forRoot(typeOrmConfigBase()),
		TypeOrmModule.forFeature([CalendarEntity]),
		forwardRef(() => AuthenticationModule),
		forwardRef(() => CalendarParticipantsModule),
		forwardRef(() => GoogleCalendarModule),
	],
	controllers: [CalendarsController],
	providers: [CalendarsRepository],
	exports: [CalendarsRepository],
})
export class CalendarsModule {}
