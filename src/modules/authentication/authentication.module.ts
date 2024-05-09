import { forwardRef, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

import { AuthenticationController } from "./authentication.controller";
import { GoogleOAuth2Service } from "./google-oauth2.service";
import { LocalAuthService } from "./local-auth.service";
import { RefreshTokensModule } from "./refresh-tokens/refresh-tokens.module";
import { RefreshTokensService } from "./refresh-tokens/refresh-tokens.service";
import { TokensService } from "./tokens.service";
import { GoogleCalendarModule } from "../google-calendar/google-calendar.module";
import { UsersModule } from "../users/users.module";

@Module({
	imports: [
		JwtModule,
		ConfigModule,
		forwardRef(() => UsersModule),
		RefreshTokensModule,
		forwardRef(() => GoogleCalendarModule),
	],
	controllers: [AuthenticationController],
	providers: [RefreshTokensService, TokensService, GoogleOAuth2Service, LocalAuthService],
	exports: [TokensService, LocalAuthService],
})
export class AuthenticationModule {}
