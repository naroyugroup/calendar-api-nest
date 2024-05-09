/* eslint-disable sonarjs/prefer-single-boolean-return */
import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	InternalServerErrorException,
	mixin,
} from "@nestjs/common";

import { ParticipantRole } from "src/entities/calendar-participant.entity";
import { CustomRequest } from "src/modules/authentication/access-token.guard";

import { CalendarParticipantsRepository } from "./calendar-participants.repository";
import { CalendarsRepository } from "../calendars.repository";

/** Must be after AccessTokens guard, and be on route with parameter named "calendarId" */
export const ParticipantRoleGuard = (role: ParticipantRole) => {
	@Injectable()
	class ParticipantRightsGuardMixin implements CanActivate {
		constructor(
			public readonly participantsRepository: CalendarParticipantsRepository,
			public readonly calendarsRepository: CalendarsRepository
		) {}

		public async canActivate(context: ExecutionContext): Promise<boolean> {
			const request = context.switchToHttp().getRequest<CustomRequest>();

			const userId = request.userId as unknown as number;
			const calendarId = request.params["calendarId"] as unknown as number;

			if (!userId || !calendarId)
				throw new InternalServerErrorException("Invalid participant rights guard usage");

			try {
				const calendar = await this.calendarsRepository.getOneWhere({ id: calendarId });

				if (calendar.ownerId == userId) return true;

				const calendarParticipant = await this.participantsRepository.getOneWhere({
					calendarId,
					userId,
				});

				if (calendarParticipant.role === ParticipantRole.OWNER) return true;

				if (role !== ParticipantRole.OWNER && calendarParticipant.role === ParticipantRole.ADMIN)
					return true;

				if (role === ParticipantRole.MEMBER && calendarParticipant.role === ParticipantRole.MEMBER)
					return true;

				return false;
			} catch {
				throw new ForbiddenException();
			}
		}
	}

	return mixin(ParticipantRightsGuardMixin);
};
