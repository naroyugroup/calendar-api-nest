import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { typeOrmConfigBase } from "src/database/ormconfig";
import { CalendarParticipantEntity } from "src/entities/calendar-participant.entity";
import { AuthenticationModule } from "src/modules/authentication/authentication.module";
import { UsersModule } from "src/modules/users/users.module";

import { CalendarParticipantsController } from "./calendar-participants.controller";
import { CalendarParticipantsRepository } from "./calendar-participants.repository";
import { CalendarParticipantsService } from "./calendar-participants.service";
import { CalendarsModule } from "../calendars.module";

@Module({
	imports: [
		TypeOrmModule.forRoot(typeOrmConfigBase()),
		TypeOrmModule.forFeature([CalendarParticipantEntity]),
		forwardRef(() => CalendarsModule),
		forwardRef(() => AuthenticationModule),
		UsersModule,
	],
	controllers: [CalendarParticipantsController],
	providers: [CalendarParticipantsRepository, CalendarParticipantsService],
	exports: [CalendarParticipantsRepository, CalendarParticipantsService],
})
export class CalendarParticipantsModule {}
