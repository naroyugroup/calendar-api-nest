import { FactoryProvider, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Redis } from "ioredis";

import { Config } from "src/config/config";

export const RedisClientProvider: FactoryProvider<Redis> = {
	provide: "RedisClient",
	useFactory: (configService: ConfigService) => {
		const redisConfig = configService.get<Config["redis"]>("redis");

		const redisInstance = new Redis({
			host: redisConfig.host,
			port: redisConfig.port,
		});

		redisInstance.on("error", (error) => {
			throw new Error(`Redis connection failed: ${error.message}`);
		});

		redisInstance.on("connect", () => {
			Logger.log("Redis is connected", "RedisClient");
		});

		return redisInstance;
	},
	inject: [ConfigService],
};
