import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { typeOrmConfigBase } from "src/database/ormconfig";
import { UserEntity } from "src/entities/user.entity";

import { UserImagesModule } from "./images/user-images.module";
import { UsersController } from "./users.controller";
import { UsersRepository } from "./users.repository";
import { AuthenticationModule } from "../authentication/authentication.module";

@Module({
	imports: [
		TypeOrmModule.forRoot(typeOrmConfigBase()),
		TypeOrmModule.forFeature([UserEntity]),
		forwardRef(() => UserImagesModule),
		forwardRef(() => AuthenticationModule),
	],
	controllers: [UsersController],
	providers: [UsersRepository],
	exports: [UsersRepository],
})
export class UsersModule {}
