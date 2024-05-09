import { Injectable, UnprocessableEntityException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { FindOptionsWhere, Repository } from "typeorm";

import { EntityRepository } from "src/common/entity.repository";
import { UserEntity } from "src/entities/user.entity";

import { CreateUserDto } from "./dtos/create-user.dto";

@Injectable()
export class UsersRepository extends EntityRepository<UserEntity> {
	constructor(
		@InjectRepository(UserEntity)
		protected readonly repository: Repository<UserEntity>
	) {
		super();
	}

	/** Delete secure fields like token and password from user object, NOT database entity */
	public omitUserSecureFields(user: UserEntity) {
		delete user.googleApiRefreshToken;
		delete user.googleCalendarSyncToken;
		delete user.password;
	}

	/** Create user and omit secure fields */
	public async create(dto: CreateUserDto) {
		try {
			const entity = await this.repository.save(
				Object.assign(dto, {
					// When register with google, password is not provided
					password: dto.password ? await bcrypt.hash(dto.password, 5) : undefined,
				})
			);

			this.omitUserSecureFields(entity);
			return entity;
		} catch (error_) {
			const error = error_ as { code: string };

			// Duplicate field error code
			if (error.code === "23505") throw new UnprocessableEntityException("Duplicate user");

			throw error;
		}
	}

	public async updateOneWhere(where: FindOptionsWhere<UserEntity>, dto: Partial<UserEntity>) {
		const entity = await this.getOneWhere(where);

		// only updates if id is the same, does not work on the string equivalent
		dto.id = entity.id;

		const updateFields = Object.assign(entity, dto, {
			password: dto.password ? await bcrypt.hash(dto.password, 5) : entity.password,
		});

		const updatedEntity = await this.repository.save(updateFields);
		this.omitUserSecureFields(updatedEntity);

		return updatedEntity;
	}
}
