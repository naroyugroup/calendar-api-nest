import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { ParticipantRole } from "src/entities/calendar-participant.entity";
import { AccessTokenGuard } from "src/modules/authentication/access-token.guard";

import { CalendarParticipantsService } from "./calendar-participants.service";
import { AddParticipantsByEmailBodyDto } from "./dtos/add-participants-by-email.dto";
import { GetAllCalendarParticipantsResultDto } from "./dtos/get-all-calendar-participants.dto";
import {
	OperateParticipantBodyDto,
	OperateParticipantParametersDto,
} from "./dtos/operate-participant.dto";
import { UpdateParticipantRoleByEmailBodyDto } from "./dtos/update-participant-role-by-email.dto";
import { ParticipantRoleGuard } from "./participant-role.guard";

@ApiTags("calendar-participants")
@Controller("calendars")
export class CalendarParticipantsController {
	constructor(private readonly service: CalendarParticipantsService) {}

	@ApiOperation({
		summary: "Add calendar participants by email list",
		description: "Set each participant as member. Admin role is required",
	})
	@ApiCookieAuth("access_token")
	@ApiResponse({ status: 401, description: "No access token provided" })
	@ApiResponse({ status: 403, description: "If current user is not calendar owner" })
	@ApiResponse({ status: 404, description: "Any user in email list is not found" })
	@UseGuards(AccessTokenGuard, ParticipantRoleGuard(ParticipantRole.ADMIN))
	@Post("/:calendarId/participants/list")
	public async addParticipantsByEmail(
		@Param() parameters: OperateParticipantParametersDto,
		@Body() body: AddParticipantsByEmailBodyDto
	) {
		return await this.service.addParticipantsByEmailList({ ...parameters, ...body });
	}

	@ApiOperation({
		summary: "Get all calendar participants",
		description: "Member role is required",
	})
	@ApiCookieAuth("access_token")
	@ApiResponse({ status: 200, type: [GetAllCalendarParticipantsResultDto] })
	@ApiResponse({ status: 401, description: "No access token provided" })
	@UseGuards(AccessTokenGuard, ParticipantRoleGuard(ParticipantRole.MEMBER))
	@Get("/:calendarId/participants/list")
	public async getAllCalendarParticipants(@Param() parameters: OperateParticipantParametersDto) {
		return await this.service.getAllCalendarParticipants({ ...parameters });
	}

	@ApiOperation({
		summary: "Update calendar participant role by email",
		description: "Owner role is required",
	})
	@ApiCookieAuth("access_token")
	@ApiResponse({ status: 401, description: "No access token provided" })
	@ApiResponse({ status: 403, description: "If current user is not calendar owner" })
	@ApiResponse({ status: 404, description: "User not found" })
	@UseGuards(AccessTokenGuard, ParticipantRoleGuard(ParticipantRole.OWNER))
	@Put("/:calendarId/participants")
	public async updateParticipantRoleByEmail(
		@Param() parameters: OperateParticipantParametersDto,
		@Body() body: UpdateParticipantRoleByEmailBodyDto
	) {
		return await this.service.updateParticipantRoleByEmail({ ...parameters, ...body });
	}

	@ApiOperation({
		summary: "Remove calendar participant by email",
		description: "Owner role is required",
	})
	@ApiCookieAuth("access_token")
	@ApiResponse({ status: 401, description: "No access token provided" })
	@ApiResponse({ status: 403, description: "If current user is not calendar owner" })
	@ApiResponse({ status: 404, description: "User not found" })
	@UseGuards(AccessTokenGuard, ParticipantRoleGuard(ParticipantRole.OWNER))
	@Delete("/:calendarId/participants")
	public async removeParticipant(
		@Param() parameters: OperateParticipantParametersDto,
		@Body() body: OperateParticipantBodyDto
	) {
		return await this.service.removeParticipantByEmail({ ...parameters, ...body });
	}
}
