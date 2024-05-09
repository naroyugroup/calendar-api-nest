import { createHash } from "node:crypto";

import { Injectable, Inject } from "@nestjs/common";
import Redis from "ioredis";

export type RefreshTokenPayload = {
	/** user id */
	uid: string;

	/** user agent */
	ua: string;
};

@Injectable()
export class RefreshTokensService {
	constructor(@Inject("RedisClient") private readonly client: Redis) {}

	private generateTokenHash(token: string): string {
		return createHash("sha256").update(token).digest("hex");
	}

	private getTokenKey(token: string, isHashed = false) {
		return `refresh_token:${isHashed ? token : this.generateTokenHash(token)}`;
	}

	private getUserTokensKey(userId: string) {
		return `user:${userId}:tokens`;
	}

	public async setToken(token: string, userId: string, userAgent: string) {
		const tokenKey = this.getTokenKey(token);
		await this.client.set(tokenKey, JSON.stringify({ uid: userId, ua: userAgent }));

		const userTokensKey = `user:${userId}:tokens`;
		await this.client.sadd(userTokensKey, this.generateTokenHash(token));
	}

	/**
	 * @returns JSON string RefreshTokenPayload
	 */
	public async getTokenData(token: string) {
		return await this.client.get(this.getTokenKey(token));
	}

	public async tokenExists(token: string) {
		return await this.client.exists(this.getTokenKey(token));
	}

	public async getUserTokensData(userId: string) {
		const tokenHashes = await this.client.smembers(this.getUserTokensKey(userId));
		const tokensData: { tokenHash: string; userId: string; userAgent: string }[] = [];

		for (const hash of tokenHashes) {
			const tokenData = await this.client.get(this.getTokenKey(hash, true));

			if (tokenData) {
				const data = JSON.parse(tokenData) as { uid: string; ua: string };

				tokensData.push({ tokenHash: hash, userId: data.uid, userAgent: data.ua });
			}
		}

		return tokensData;
	}

	public async revokeToken(token: string, isHashed = false) {
		const tokenKey = this.getTokenKey(token, isHashed);

		const tokenRawData = await this.client.get(tokenKey);
		const tokenData = JSON.parse(tokenRawData) as { uid: string; ua: string };

		await this.client.del(tokenKey);

		const userTokensKey = this.getUserTokensKey(tokenData.uid);
		await this.client.srem(userTokensKey, isHashed ? token : this.generateTokenHash(token));
	}
}
