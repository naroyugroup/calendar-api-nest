import { randomUUID } from "node:crypto";

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import { Config } from "src/config/config";

@Injectable()
export class TokensService {
	constructor(
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService
	) {}

	public async getTokens(id: string) {
		const accessToken = await this.jwtService.signAsync(
			{
				sub: id,
			},
			{
				secret: this.configService.get<Config["accessTokenSecret"]>("accessTokenSecret"),
				expiresIn: "15m",
			}
		);

		const refreshToken = randomUUID();

		return {
			accessToken,
			refreshToken,
		};
	}

	/**
	 * @throws UnauthorizedException if invalid
	 * @returns JWT payload
	 */
	public async validateAccessToken(accessToken: string) {
		try {
			return this.jwtService.verifyAsync<{ sub: string }>(accessToken, {
				secret: this.configService.get<Config["accessTokenSecret"]>("accessTokenSecret"),
			});
		} catch {
			throw new UnauthorizedException();
		}
	}
}
