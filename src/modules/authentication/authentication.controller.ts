/* eslint-disable import/no-extraneous-dependencies */
import {
	Body,
	Controller,
	Get,
	Post,
	Query,
	Redirect,
	Req,
	Res,
	UnauthorizedException,
} from "@nestjs/common";
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Request, Response } from "express";

import { LoginUserBodyDto } from "./dtos/login-user.dto";
import { RegisterUserBodyDto } from "./dtos/register-user.dto";
import { GoogleOAuth2Service } from "./google-oauth2.service";
import { LocalAuthService } from "./local-auth.service";
import { GoogleCalendarService } from "../google-calendar/google-calendar.service";

@ApiTags("authentication")
@Controller("auth")
export class AuthenticationController {
	constructor(
		private googleOAuth2Service: GoogleOAuth2Service,
		private localAuthService: LocalAuthService,
		private googleCalendarService: GoogleCalendarService
	) {}

	@ApiOperation({ summary: "Local login and set access cookies" })
	@ApiResponse({ status: 201, description: "Set access and refresh tokens cookies" })
	@ApiResponse({ status: 401, description: "Invalid credentials" })
	@Post("/login")
	public async logIn(
		@Req() request: Request,
		@Body() dto: LoginUserBodyDto,
		@Res({ passthrough: true }) response: Response
	) {
		const tokens = await this.localAuthService.logIn(
			Object.assign(dto, { userAgent: request.get("user-agent") })
		);

		this.localAuthService.setTokensToCookies(response, tokens);
	}

	@ApiOperation({ summary: "Local register and set access cookies" })
	@ApiResponse({ status: 201, description: "Set access and refresh tokens cookies" })
	@ApiResponse({ status: 422, description: "User already exists" })
	@Post("/register")
	public async register(
		@Req() request: Request,
		@Body() dto: RegisterUserBodyDto,
		@Res({ passthrough: true }) response: Response
	) {
		const tokens = await this.localAuthService.register(
			Object.assign(dto, { userAgent: request.get("user-agent") })
		);

		this.localAuthService.setTokensToCookies(response, tokens);
	}

	@ApiOperation({ summary: "Logout and clear access cookies" })
	@ApiResponse({ status: 403, description: "Refresh token is not valid" })
	@Post("/logout")
	public async logOut(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
		const refreshToken = request.signedCookies["refresh_token"] as string;

		if (refreshToken) await this.localAuthService.logOut(refreshToken);

		response.clearCookie("access_token");
		response.clearCookie("refresh_token");
	}

	@ApiOperation({ summary: "Refresh and set access cookies" })
	@ApiCookieAuth("access_token")
	@ApiResponse({
		status: 201,
		description: "Refresh and set new refresh and access tokens cookies",
	})
	@ApiResponse({ status: 401, description: "No access token provided" })
	@Post("/refresh")
	public async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
		const refreshToken = request.signedCookies["refresh_token"] as string;

		if (!refreshToken) throw new UnauthorizedException();

		const tokens = await this.localAuthService.refreshTokens(
			refreshToken,
			request.get("user-agent")
		);

		this.localAuthService.setTokensToCookies(response, tokens);
	}

	@ApiOperation({ summary: "Google OAuth2 endpoint" })
	@Get("google")
	@Redirect()
	public googleAuth() {
		return { url: this.googleOAuth2Service.getAuthUrl(), status: 302 };
	}

	@ApiOperation({ summary: "Google OAuth2 callback endpoint" })
	@Get("google/callback")
	public async googleCallback(
		@Req() request: Request,
		@Query("code") callbackCode: string,
		@Res({ passthrough: true }) response: Response
	) {
		const data = await this.googleOAuth2Service.signIn(callbackCode, request.get("user-agent"));

		this.localAuthService.setTokensToCookies(response, data);

		await this.googleCalendarService.init(data.userId);
	}
}
