/* eslint-disable unicorn/prefer-top-level-await */
import { readFileSync } from "node:fs";

import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import helmet from "helmet";

import { AppModule } from "./app.module";
import config from "./config/config";

async function bootstrap() {
	const { port, cookieSecret } = config();

	const httpsOptions = {
		key: readFileSync("./src/cert/key.pem"),
		cert: readFileSync("./src/cert/cert.pem"),
	};

	const swaggerConfig = new DocumentBuilder()
		.setTitle("Naroyu Calendar")
		.setVersion("1.0.0")
		.addCookieAuth("refresh_token")
		.addCookieAuth("access_token")
		.build();

	const app = await NestFactory.create(AppModule, { httpsOptions });

	app.setGlobalPrefix("api");

	app.enableCors({
		origin: true,
		methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
		preflightContinue: false,
		optionsSuccessStatus: 204,
		credentials: true,
	});
	app.use(helmet());
	app.use(cookieParser(cookieSecret));
	app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

	const document = SwaggerModule.createDocument(app, swaggerConfig);
	SwaggerModule.setup("/api/docs", app, document);

	await app.listen(port);
	Logger.log(
		`Gateway is started on https://localhost:${port} in ${
			process.env.NODE_ENV || "development"
		} mode`,
		"NestApplication"
	);
}

void bootstrap();
