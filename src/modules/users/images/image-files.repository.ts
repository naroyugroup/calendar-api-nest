import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { Config } from "src/config/config";

@Injectable()
export class ImageFilesRepository {
	private readonly s3Client: S3Client;

	private readonly region: string;
	private readonly imagesBucketName: string;

	constructor(private readonly configService: ConfigService) {
		const { region, accessKey, secretKey, imagesBucketName } =
			this.configService.get<Config["aws-s3"]>("aws-s3");

		this.region = region;
		this.imagesBucketName = imagesBucketName;

		this.s3Client = new S3Client({
			credentials: {
				accessKeyId: accessKey,
				secretAccessKey: secretKey,
			},
			region: this.region,
		});
	}

	public isS3Url(url: string) {
		return /https:\/\/\S*\.amazonaws.com\/\S*/gm.test(url);
	}

	public getDotFileExtension(name: string) {
		return name.match(/\.[\da-z]+$/i)[0];
	}

	public getUrl(key: string) {
		return `https://s3.${this.region}.amazonaws.com/${this.imagesBucketName}/${key}`;
	}

	/**
	 * @param url "https://s3.region.amazonaws.com/bucketName/key"
	 * @return "bucketName/key"
	 */
	public getKey(url: string) {
		return url.split("/").slice(3).join("/");
	}

	public async upload(buffer: Buffer, key: string) {
		const command = new PutObjectCommand({
			Bucket: this.imagesBucketName,
			Body: buffer,
			Key: key,
		});

		return await this.s3Client.send(command);
	}

	public async get(key: string) {
		const command = new GetObjectCommand({
			Bucket: this.imagesBucketName,
			Key: key,
		});

		return await this.s3Client.send(command);
	}

	public async delete(key: string) {
		const command = new DeleteObjectCommand({
			Bucket: this.imagesBucketName,
			Key: key,
		});

		return await this.s3Client.send(command);
	}
}
