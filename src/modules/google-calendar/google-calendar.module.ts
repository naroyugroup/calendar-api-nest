import { forwardRef, Module } from "@nestjs/common";

import { GoogleCalendarController } from "./google-calendar.controller";
import { GoogleCalendarRepository } from "./google-calendar.repository";
import { GoogleCalendarService } from "./google-calendar.service";
import { AuthenticationModule } from "../authentication/authentication.module";
import { CalendarsModule } from "../calendars/calendars.module";
import { EventsModule } from "../events/events.module";
import { UsersModule } from "../users/users.module";

@Module({
	imports: [
		forwardRef(() => CalendarsModule),
		forwardRef(() => EventsModule),
		forwardRef(() => UsersModule),
		forwardRef(() => AuthenticationModule),
	],
	controllers: [GoogleCalendarController],
	providers: [GoogleCalendarRepository, GoogleCalendarService],
	exports: [GoogleCalendarService],
})
export class GoogleCalendarModule {}
