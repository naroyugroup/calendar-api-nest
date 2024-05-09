import {
	Body,
	Controller,
	Delete,
	Get,
	NotFoundException,
	Param,
	Post,
	Put,
	UseGuards,
} from "@nestjs/common";
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { ParticipantRole } from "src/entities/calendar-participant.entity";
import { CalendarEntity } from "src/entities/calendar.entity";
import { AccessTokenGuard } from "src/modules/authentication/access-token.guard";
import { AuthenticatedUser } from "src/modules/authentication/authenticated-user.decorator";
import { GoogleCalendarService } from "src/modules/google-calendar/google-calendar.service";
import { GoogleNotConnectedError } from "src/modules/google-calendar/google-not-connected.error";

import { CalendarsRepository } from "./calendars.repository";
import { CalendarWithParticipantsDto } from "./dtos/calendar.dto";
import { CreateCalendarBodyDto } from "./dtos/create-calendar.dto";
import { OperateCalendarByIdDto } from "./dtos/operate-calendar-by-id.dto";
import { UpdateCalendarFavoriteStatusBodyDto } from "./dtos/update-calendar-favorite-status.dto";
import { UpdateCalendarBodyDto } from "./dtos/update-calendar.dto";
import { CalendarParticipantsRepository } from "./participants/calendar-participants.repository";
import { CalendarParticipantsService } from "./participants/calendar-participants.service";
import { ParticipantRoleGuard } from "./participants/participant-role.guard";

@ApiTags("calendars")
@Controller("calendars")
export class CalendarsController {
	constructor(
		private readonly repository: CalendarsRepository,
		private readonly participantsRepository: CalendarParticipantsRepository,
		private readonly participantsService: CalendarParticipantsService,
		private readonly googleCalendarService: GoogleCalendarService
	) {}

	@ApiOperation({
		summary: "Get all available calendars",
		description: "Available means that user owns and participates in",
	})
	@ApiCookieAuth("access_token")
	@ApiResponse({ status: 200, type: [CalendarWithParticipantsDto] })
	@ApiResponse({ status: 401, description: "No access token provided" })
	@UseGuards(AccessTokenGuard)
	@Get("/all")
	public async getAllCalendars(@AuthenticatedUser() userId: number) {
		const calendars = await this.repository.getWhere({ ownerId: userId });

		const userParticipations = await this.participantsRepository.getWhere({ userId });

		for (const participation of userParticipations) {
			const calendar = await this.repository.getOneWhere({ id: participation.calendarId });
			calendars.push(Object.assign(calendar, { favorite: participation.favorite }));
		}

		for (const calendar of calendars) {
			const participants = await this.participantsService.getAllCalendarParticipants({
				calendarId: calendar.id,
			});

			Object.assign(calendar, { participants });
		}

		return calendars;
	}

	@ApiOperation({ summary: "Get calendar by id", description: "Member role is required" })
	@ApiCookieAuth("access_token")
	@ApiResponse({ status: 200, type: CalendarWithParticipantsDto })
	@ApiResponse({ status: 401, description: "No access token provided" })
	@ApiResponse({ status: 404, description: "Not found" })
	@UseGuards(AccessTokenGuard, ParticipantRoleGuard(ParticipantRole.MEMBER))
	@Get("/:calendarId")
	public async getCalendar(
		@Param() parameters: OperateCalendarByIdDto,
		@AuthenticatedUser() userId: number
	) {
		const calendar = await this.repository.getOneWhere({ id: parameters.calendarId });
		const participants = await this.participantsService.getAllCalendarParticipants({
			calendarId: calendar.id,
		});

		Object.assign(calendar, { participants });

		if (calendar.ownerId == userId) return calendar;

		const userParticipations = await this.participantsRepository.getWhere({ userId });
		const participation = userParticipations.find(
			(participation) => participation.calendarId == parameters.calendarId
		);
		if (participation) return Object.assign(calendar, { favorite: participation.favorite });

		throw new NotFoundException();
	}

	@ApiOperation({ summary: "Create calendar" })
	@ApiCookieAuth("access_token")
	@ApiResponse({ status: 201, type: CalendarEntity })
	@ApiResponse({ status: 401, description: "No access token provided" })
	@UseGuards(AccessTokenGuard)
	@Post("/")
	public async createCalendar(
		@Body() body: CreateCalendarBodyDto,
		@AuthenticatedUser() userId: number
	): Promise<CalendarEntity> {
		const calendar = await this.repository.create({ ...body, ownerId: userId });

		try {
			await this.googleCalendarService.upsertCalendar(calendar.id);
		} catch (error_) {
			const error = error_ as Error;
			if (error.name !== GoogleNotConnectedError.name) throw error;
		}

		return calendar;
	}

	@ApiOperation({ summary: "Update calendar by id", description: "Admin role is required" })
	@ApiCookieAuth("access_token")
	@ApiResponse({ status: 200, type: CalendarEntity })
	@ApiResponse({ status: 401, description: "No access token provided" })
	@ApiResponse({ status: 404, description: "Not found" })
	@UseGuards(AccessTokenGuard, ParticipantRoleGuard(ParticipantRole.ADMIN))
	@Put("/:calendarId")
	public async updateCalendar(
		@Param() parameters: OperateCalendarByIdDto,
		@Body() body: UpdateCalendarBodyDto
	): Promise<CalendarEntity> {
		const calendar = await this.repository.updateOneWhere({ id: parameters.calendarId }, body);

		try {
			await this.googleCalendarService.upsertCalendar(calendar.id);
		} catch (error_) {
			const error = error_ as Error;
			if (error.name !== GoogleNotConnectedError.name) throw error;
		}

		return calendar;
	}

	@ApiOperation({
		summary: "Update calendar favorite status by id",
		description: "Member role is required",
	})
	@ApiCookieAuth("access_token")
	@ApiResponse({ status: 200, type: CalendarEntity })
	@ApiResponse({ status: 401, description: "No access token provided" })
	@ApiResponse({ status: 404, description: "Not found" })
	@UseGuards(AccessTokenGuard, ParticipantRoleGuard(ParticipantRole.MEMBER))
	@Put("/:calendarId/favorite")
	public async updateCalendarFavoriteStatus(
		@Param() parameters: OperateCalendarByIdDto,
		@Body() body: UpdateCalendarFavoriteStatusBodyDto,
		@AuthenticatedUser() userId: number
	): Promise<CalendarEntity> {
		const calendar = await this.repository.getOneWhere({ id: parameters.calendarId });

		if (userId === calendar.ownerId) {
			return await this.repository.updateOneWhere({ id: parameters.calendarId }, body);
		} else {
			await this.participantsRepository.updateOneWhere(
				{ userId, calendarId: parameters.calendarId },
				body
			);
			return Object.assign(calendar, body);
		}
	}

	@ApiOperation({ summary: "Delete calendar by id", description: "Owner role is required" })
	@ApiCookieAuth("access_token")
	@ApiResponse({ status: 401, description: "No access token provided" })
	@UseGuards(AccessTokenGuard, ParticipantRoleGuard(ParticipantRole.OWNER))
	@Delete("/:calendarId")
	public async deleteCalendar(@Param() parameters: OperateCalendarByIdDto) {
		try {
			await this.googleCalendarService.deleteCalendar(parameters.calendarId);
		} catch (error_) {
			const error = error_ as Error;
			if (error.name !== GoogleNotConnectedError.name) throw error;
		}

		return await this.repository.deleteOneWhere({ id: parameters.calendarId });
	}
}
