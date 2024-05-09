const config = () => ({
	port: Number.parseInt(process.env.PORT, 10) || 80,
	cookieSecret: process.env.COOKIE_SECRET || "secret",
	accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || "secret",
	postgres: {
		host: process.env.POSTGRES_HOST || "127.0.0.1",
		port: Number.parseInt(process.env.POSTGRES_PORT, 10) || 5432,
		username: process.env.POSTGRES_USERNAME || "root",
		password: process.env.POSTGRES_PASSWORD || "toor",
		database: process.env.POSTGRES_DATABASE || "calendar",
	},
	redis: {
		host: process.env.REDIS_HOST || "127.0.0.1",
		port: Number.parseInt(process.env.POSTGRES_PORT, 10) || 6379,
	},
	googleOAuth2: {
		clientId: process.env.GOOGLE_OAUTH2_CLIENT_ID,
		clientSecret: process.env.GOOGLE_OAUTH2_CLIENT_SECRET,
	},
	"aws-s3": {
		region: process.env.AWS_REGION || "us-east-1",
		accessKey: process.env.AWS_ACCESS_KEY,
		secretKey: process.env.AWS_SECRET_ACCESS_KEY,
		imagesBucketName: process.env.IMAGES_BUCKET_NAME || "naroyu-calendar-images",
	},
});

export type Config = ReturnType<typeof config>;

export default config;
