/* eslint-disable import/no-extraneous-dependencies */
import {
	ForbiddenException,
	Injectable,
	UnauthorizedException,
	UnprocessableEntityException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { Response } from "express";

import { LoginUserDto } from "./dtos/login-user.dto";
import { RegisterUserDto } from "./dtos/register-user.dto";
import { RefreshTokenPayload, RefreshTokensService } from "./refresh-tokens/refresh-tokens.service";
import { TokensService } from "./tokens.service";
import { UsersRepository } from "../users/users.repository";

@Injectable()
export class LocalAuthService {
	constructor(
		private readonly usersRepository: UsersRepository,
		private readonly tokensService: TokensService,
		private readonly refreshTokensService: RefreshTokensService
	) {}

	public async register(dto: RegisterUserDto) {
		try {
			await this.usersRepository.getOneWhere({ email: dto.email });

			throw new UnprocessableEntityException("User already exists");
		} catch {
			/* User should not exist */
		}

		const user = await this.usersRepository.create(dto);
		const tokens = await this.tokensService.getTokens(String(user.id));

		await this.refreshTokensService.setToken(tokens.refreshToken, String(user.id), dto.userAgent);

		return tokens;
	}

	public async logIn(dto: LoginUserDto) {
		// throws if not found
		const user = await this.usersRepository.getOneWhere({ email: dto.email });

		if (!user.password) throw new UnauthorizedException("Invalid credentials");

		const compareResult = await bcrypt.compare(dto.password, user.password);
		if (!compareResult) throw new UnauthorizedException("Invalid credentials");

		const tokens = await this.tokensService.getTokens(String(user.id));

		await this.refreshTokensService.setToken(tokens.refreshToken, String(user.id), dto.userAgent);

		return tokens;
	}

	public async logOut(refreshToken: string) {
		await this.refreshTokensService.revokeToken(refreshToken);
	}

	public async refreshTokens(refreshToken: string, userAgent: string) {
		const tokenExists = await this.refreshTokensService.tokenExists(refreshToken);
		if (!tokenExists) throw new ForbiddenException("Refresh token is not valid");

		const { uid } = JSON.parse(
			await this.refreshTokensService.getTokenData(refreshToken)
		) as RefreshTokenPayload;

		await this.refreshTokensService.revokeToken(refreshToken);

		const tokens = await this.tokensService.getTokens(uid);
		await this.refreshTokensService.setToken(tokens.refreshToken, uid, userAgent);

		return tokens;
	}

	public setTokensToCookies(
		response: Response,
		tokens: { accessToken: string; refreshToken: string }
	) {
		response.cookie("access_token", tokens.accessToken, {
			sameSite: "none",
			httpOnly: true,
			signed: true,
			secure: true,
			maxAge: 15 * 60 * 1000, // 15m
		});

		response.cookie("refresh_token", tokens.refreshToken, {
			sameSite: "none",
			httpOnly: true,
			signed: true,
			secure: true,
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
		});
	}
}
