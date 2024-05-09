import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OAuth2Client } from "google-auth-library";

import { Config } from "src/config/config";
import { UserEntity } from "src/entities/user.entity";

import { RefreshTokensService } from "./refresh-tokens/refresh-tokens.service";
import { TokensService } from "./tokens.service";
import { UsersRepository } from "../users/users.repository";

@Injectable()
export class GoogleOAuth2Service {
	private readonly client: OAuth2Client;

	constructor(
		private readonly configService: ConfigService,
		private readonly usersRepository: UsersRepository,
		private readonly tokensService: TokensService,
		private readonly refreshTokensService: RefreshTokensService
	) {
		const { clientId, clientSecret } =
			this.configService.get<Config["googleOAuth2"]>("googleOAuth2");

		this.client = new OAuth2Client(
			clientId,
			clientSecret,
			"http://localhost/api/auth/google/callback"
		);
	}

	public getAuthUrl() {
		return this.client.generateAuthUrl({
			scope: [
				"https://www.googleapis.com/auth/userinfo.email",
				"https://www.googleapis.com/auth/userinfo.profile",
				"https://www.googleapis.com/auth/calendar",
			],
			access_type: "offline",
		});
	}

	public async extractUserData(callbackCode: string) {
		try {
			const response = await this.client.getToken(callbackCode);
			const ticket = await this.client.verifyIdToken({ idToken: response.tokens.id_token });

			const payload = ticket.getPayload();

			return {
				user: {
					googleId: payload.sub,
					email: payload.email,
					name: payload.name,
					picture: payload.picture,
				},
				tokens: {
					accessToken: response.tokens.access_token,
					refreshToken: response.tokens.refresh_token,
					idToken: response.tokens.id_token,
				},
			};
		} catch {
			throw new UnauthorizedException();
		}
	}

	public async signIn(callbackCode: string, userAgent: string) {
		const data = await this.extractUserData(callbackCode);

		let user: UserEntity;

		try {
			// throws if user not found
			user = await this.usersRepository.getOneWhere({ email: data.user.email });

			if (!user.googleId || !user.googleApiRefreshToken)
				await this.usersRepository.updateOneWhere(
					{ id: user.id },
					{
						googleId: data.user.googleId || user.googleId,
						googleApiRefreshToken: data.tokens.refreshToken || user.googleApiRefreshToken,
					}
				);
		} catch {
			user = await this.usersRepository.create(
				Object.assign(data.user, { googleApiRefreshToken: data.tokens.refreshToken })
			);
		}

		const tokens = await this.tokensService.getTokens(String(user.id));
		await this.refreshTokensService.setToken(tokens.refreshToken, String(user.id), userAgent);

		return {
			userId: user.id,
			googleIdToken: data.tokens.idToken,
			googleAccessToken: data.tokens.accessToken,
			googleRefreshToken: data.tokens.refreshToken,
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken,
		};
	}

	/** Google OAuth2 refresh token is eternal (in testing mode 7 days) */
	public async refreshAccessToken(refreshToken: string) {
		const { clientId, clientSecret } =
			this.configService.get<Config["googleOAuth2"]>("googleOAuth2");

		const client = new OAuth2Client({
			clientId,
			clientSecret,
			credentials: { refresh_token: refreshToken },
		});

		try {
			const { credentials } = await client.refreshAccessToken();

			return credentials.access_token;
		} catch {
			throw new Error("Failed to refresh access token");
		}
	}
}
