import { forwardRef, Module } from "@nestjs/common";

import { AuthenticationModule } from "src/modules/authentication/authentication.module";

import { ImageFilesRepository } from "./image-files.repository";
import { UserImagesController } from "./user-images.controller";
import { UsersModule } from "../users.module";

@Module({
	imports: [forwardRef(() => UsersModule), forwardRef(() => AuthenticationModule)],
	controllers: [UserImagesController],
	providers: [ImageFilesRepository],
	exports: [ImageFilesRepository],
})
export class UserImagesModule {}
