import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { ParticipantRole } from "src/entities/calendar-participant.entity";
import { EventEntity } from "src/entities/event.entity";

import { GoogleCalendarService } from "./../google-calendar/google-calendar.service";
import { CreateEventBodyDto, CreateEventParametersDto } from "./dtos/create-event.dto";
import {
	GetEventsByDateRangeParametersDto,
	GetEventsByDateRangeQueryDto,
} from "./dtos/get-events-by-date-range.dto";
import { OperateEventDto } from "./dtos/operate-event.dto";
import { UpdateEventBodyDto } from "./dtos/update-event.dto";
import { EventsRepository } from "./events.repository";
import { EventsService } from "./events.service";
import { AccessTokenGuard } from "../authentication/access-token.guard";
import { ParticipantRoleGuard } from "../calendars/participants/participant-role.guard";
import { GoogleNotConnectedError } from "../google-calendar/google-not-connected.error";

@ApiTags("events")
@Controller("calendars")
export class EventsController {
	constructor(
		private readonly repository: EventsRepository,
		private readonly service: EventsService,
		private readonly googleCalendarService: GoogleCalendarService
	) {}

	@ApiOperation({ summary: "Create event" })
	@ApiCookieAuth("access_token")
	@ApiResponse({ status: 201, type: EventEntity })
	@ApiResponse({ status: 401, description: "No access token provided" })
	@ApiResponse({ status: 403, description: "Forbidden" })
	@UseGuards(AccessTokenGuard, ParticipantRoleGuard(ParticipantRole.ADMIN))
	@Post("/:calendarId/events")
	public async createEvent(
		@Param() parameters: CreateEventParametersDto,
		@Body() body: CreateEventBodyDto
	): Promise<EventEntity> {
		const event = await this.repository.create({ ...parameters, ...body });

		try {
			await this.googleCalendarService.upsertEvent(event.id);
		} catch (error_) {
			const error = error_ as Error;
			if (error.name !== GoogleNotConnectedError.name) throw error;
		}

		return event;
	}

	@ApiOperation({ summary: "Get events by date range" })
	@ApiCookieAuth("access_token")
	@ApiResponse({ status: 200, type: [EventEntity] })
	@ApiResponse({ status: 401, description: "No access token provided" })
	@ApiResponse({ status: 403, description: "Forbidden" })
	@UseGuards(AccessTokenGuard, ParticipantRoleGuard(ParticipantRole.MEMBER))
	@Get("/:calendarId/events/range")
	public async getEventsByDateRange(
		@Param() parameters: GetEventsByDateRangeParametersDto,
		@Query() query: GetEventsByDateRangeQueryDto
	): Promise<EventEntity[]> {
		return await this.service.getByDateRange({ ...parameters, ...query });
	}

	@ApiOperation({ summary: "Get event by id" })
	@ApiCookieAuth("access_token")
	@ApiResponse({ status: 200, type: EventEntity })
	@ApiResponse({ status: 401, description: "No access token provided" })
	@ApiResponse({ status: 403, description: "Forbidden" })
	@ApiResponse({ status: 404, description: "Not found" })
	@UseGuards(AccessTokenGuard, ParticipantRoleGuard(ParticipantRole.MEMBER))
	@Get("/:calendarId/events/:id")
	public async getEvent(@Param() parameters: CreateEventParametersDto): Promise<EventEntity> {
		return await this.repository.getOneWhere(parameters);
	}

	@ApiOperation({ summary: "Update event by id" })
	@ApiCookieAuth("access_token")
	@ApiResponse({ status: 200, type: EventEntity })
	@ApiResponse({ status: 401, description: "No access token provided" })
	@ApiResponse({ status: 403, description: "Forbidden" })
	@ApiResponse({ status: 404, description: "Not found" })
	@UseGuards(AccessTokenGuard, ParticipantRoleGuard(ParticipantRole.ADMIN))
	@Put("/:calendarId/events/:id")
	public async updateEvent(
		@Param() parameters: OperateEventDto,
		@Body() body: UpdateEventBodyDto
	): Promise<EventEntity> {
		const event = await this.repository.updateOneWhere(parameters, body);

		try {
			await this.googleCalendarService.upsertEvent(event.id);
		} catch (error_) {
			const error = error_ as Error;
			if (error.name !== GoogleNotConnectedError.name) throw error;
		}

		return event;
	}

	@ApiOperation({ summary: "Delete event by id" })
	@ApiCookieAuth("access_token")
	@ApiResponse({ status: 401, description: "No access token provided" })
	@ApiResponse({ status: 403, description: "Forbidden" })
	@UseGuards(AccessTokenGuard, ParticipantRoleGuard(ParticipantRole.ADMIN))
	@Delete("/:calendarId/events/:id")
	public async deleteEvent(@Param() parameters: OperateEventDto) {
		try {
			await this.googleCalendarService.deleteEvent(parameters.id);
		} catch (error_) {
			const error = error_ as Error;
			if (error.name !== GoogleNotConnectedError.name) throw error;
		}

		return await this.repository.deleteOneWhere(parameters);
	}
}
