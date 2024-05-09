import { randomUUID } from "node:crypto";

import {
	Post,
	UseGuards,
	UseInterceptors,
	UploadedFile,
	BadRequestException,
	InternalServerErrorException,
	Controller,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { AccessTokenGuard } from "src/modules/authentication/access-token.guard";
import { AuthenticatedUser } from "src/modules/authentication/authenticated-user.decorator";

import { ImageFilesRepository } from "./image-files.repository";
import { UsersRepository } from "../users.repository";

@ApiTags("user-images")
@Controller("/users/images")
export class UserImagesController {
	constructor(
		private readonly imageFilesRepository: ImageFilesRepository,
		private readonly usersRepository: UsersRepository
	) {}

	@ApiOperation({ summary: "Upload user image to S3 and set as picture field in user entity" })
	@ApiCookieAuth("access_token")
	@ApiConsumes("multipart/form-data")
	@ApiResponse({ status: 400, description: "Image is not provided" })
	@ApiResponse({ status: 401, description: "No access token provided" })
	@Post("/")
	@UseGuards(AccessTokenGuard)
	@UseInterceptors(FileInterceptor("file"))
	public async setUserImage(
		@UploadedFile() file: Express.Multer.File,
		@AuthenticatedUser() userId: number
	) {
		if (!file) {
			throw new BadRequestException("Image is not provided");
		}

		const user = await this.usersRepository.getOneWhere({ id: userId });

		if (user.picture && this.imageFilesRepository.isS3Url(user.picture)) {
			await this.imageFilesRepository.delete(this.imageFilesRepository.getKey(user.picture));
		}

		const key = `${randomUUID()}${this.imageFilesRepository.getDotFileExtension(
			file.originalname
		)}`;

		await this.imageFilesRepository.upload(file.buffer, key);

		try {
			await this.usersRepository.updateOneWhere(
				{ id: userId },
				{ picture: this.imageFilesRepository.getUrl(key) }
			);
		} catch {
			await this.imageFilesRepository.delete(key);

			throw new InternalServerErrorException();
		}
	}
}
