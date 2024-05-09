/* eslint-disable import/no-extraneous-dependencies */
import {
	Injectable,
	CanActivate,
	ExecutionContext,
	UnauthorizedException,
	InternalServerErrorException,
} from "@nestjs/common";
import { Request, Response } from "express";

import { LocalAuthService } from "./local-auth.service";
import { TokensService } from "./tokens.service";

export type CustomRequest = Request & { userId: number };

@Injectable()
export class AccessTokenGuard implements CanActivate {
	constructor(
		private readonly tokensService: TokensService,
		private readonly localAuthService: LocalAuthService
	) {}

	public async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<CustomRequest>();
		const response = context.switchToHttp().getResponse<Response>();

		let accessToken = request.signedCookies["access_token"] as string;

		if (!accessToken) {
			const refreshToken = request.signedCookies["refresh_token"] as string;

			if (!refreshToken) throw new UnauthorizedException();

			const tokens = await this.localAuthService.refreshTokens(
				refreshToken,
				request.get("user-agent")
			);

			accessToken = tokens.accessToken;

			this.localAuthService.setTokensToCookies(response, tokens);
		}

		const validationResult = await this.tokensService.validateAccessToken(accessToken);
		if (!validationResult) throw new UnauthorizedException("Invalid access token");

		const userId = Number.parseInt(validationResult.sub);
		if (Number.isNaN(userId)) throw new InternalServerErrorException();

		request.userId = userId;

		return true;
	}
}
