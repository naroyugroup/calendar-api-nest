import { Body, Controller, ForbiddenException, Get, Put, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { UserEntity } from "src/entities/user.entity";

import { UpdateUserByIdDtoBody } from "./dtos/update-user-by-id.dto";
import { UpdateUserPasswordByIdDtoBody } from "./dtos/update-user-password-by-id.dto";
import { UsersRepository } from "./users.repository";
import { AccessTokenGuard } from "../authentication/access-token.guard";
import { AuthenticatedUser } from "../authentication/authenticated-user.decorator";

@ApiTags("users")
@Controller("users")
export class UsersController {
	constructor(private readonly repository: UsersRepository) {}

	@ApiOperation({ summary: "Get current user" })
	@ApiCookieAuth("access_token")
	@ApiResponse({ status: 200, type: UserEntity })
	@ApiResponse({ status: 401, description: "No access token provided" })
	@UseGuards(AccessTokenGuard)
	@Get("/me")
	public async getCurrentUser(@AuthenticatedUser() userId: number): Promise<UserEntity> {
		const user = await this.repository.getOneWhere({ id: userId });
		this.repository.omitUserSecureFields(user);

		return user;
	}

	@ApiOperation({ summary: "Update user" })
	@ApiCookieAuth("access_token")
	@ApiResponse({ status: 200, type: UserEntity })
	@ApiResponse({ status: 401, description: "No access token provided" })
	@UseGuards(AccessTokenGuard)
	@Put("/me")
	public async updateUser(
		@Body() body: UpdateUserByIdDtoBody,
		@AuthenticatedUser() userId: number
	): Promise<UserEntity> {
		return await this.repository.updateOneWhere({ id: userId }, body);
	}

	@ApiOperation({ summary: "Update user password" })
	@ApiCookieAuth("access_token")
	@ApiResponse({ status: 200, type: UserEntity })
	@ApiResponse({ status: 401, description: "No access token provided" })
	@ApiResponse({
		status: 403,
		description: "Account is registered with google, cannot change password",
	})
	@UseGuards(AccessTokenGuard)
	@Put("/me/password")
	public async updateUserPassword(
		@Body() body: UpdateUserPasswordByIdDtoBody,
		@AuthenticatedUser() userId: number
	): Promise<UserEntity> {
		const user = await this.repository.getOneWhere({ id: userId });

		if (user.googleId && body.password)
			throw new ForbiddenException("Account is registered with google, cannot change password");

		return await this.repository.updateOneWhere({ id: userId }, body);
	}
}
