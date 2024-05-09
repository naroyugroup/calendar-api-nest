import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { typeOrmConfigBase } from "src/database/ormconfig";
import { EventPeriodEntity } from "src/entities/event-period.entity";
import { EventEntity } from "src/entities/event.entity";

import { EventsController } from "./events.controller";
import { EventsRepository } from "./events.repository";
import { EventsService } from "./events.service";
import { AuthenticationModule } from "../authentication/authentication.module";
import { CalendarsModule } from "../calendars/calendars.module";
import { CalendarParticipantsModule } from "../calendars/participants/calendar-participants.module";
import { GoogleCalendarModule } from "../google-calendar/google-calendar.module";

@Module({
	imports: [
		TypeOrmModule.forRoot(typeOrmConfigBase()),
		TypeOrmModule.forFeature([EventEntity, EventPeriodEntity]),
		forwardRef(() => CalendarsModule),
		forwardRef(() => CalendarParticipantsModule),
		forwardRef(() => AuthenticationModule),
		forwardRef(() => GoogleCalendarModule),
	],
	controllers: [EventsController],
	providers: [EventsRepository, EventsService],
	exports: [EventsRepository],
})
export class EventsModule {}
