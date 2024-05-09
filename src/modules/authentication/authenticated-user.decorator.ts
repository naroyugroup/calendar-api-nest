import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import { CustomRequest } from "./access-token.guard";

export const AuthenticatedUser = createParamDecorator(
	(_data: unknown, context: ExecutionContext) => {
		const request = context.switchToHttp().getRequest<CustomRequest>();

		return request.userId;
	}
);
