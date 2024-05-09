import { Controller, Post, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { AccessTokenGuard } from "src/modules/authentication/access-token.guard";
import { AuthenticatedUser } from "src/modules/authentication/authenticated-user.decorator";

import { GoogleCalendarService } from "./google-calendar.service";

@ApiTags("google-calendar")
@Controller()
export class GoogleCalendarController {
	constructor(private readonly service: GoogleCalendarService) {}

	@ApiOperation({ summary: "Synchronize google calendar events and calendars" })
	@ApiCookieAuth("access_token")
	@ApiResponse({ status: 401, description: "No access token provided" })
	@UseGuards(AccessTokenGuard)
	@Post("/resources/google/sync")
	public async sync(@AuthenticatedUser() userId: number) {
		return await this.service.synchronizeAllUserResources(userId);
	}
}
