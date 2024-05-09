import { Module } from "@nestjs/common";

import { RedisClientProvider } from "src/database/redis-client.provider";

import { RefreshTokensService } from "./refresh-tokens.service";

@Module({
	imports: [],
	controllers: [],
	providers: [RedisClientProvider, RefreshTokensService],
	exports: [RedisClientProvider, RefreshTokensService],
})
export class RefreshTokensModule {}
