import { NotFoundException } from "@nestjs/common";
import { FindOptionsRelations, FindOptionsWhere, ObjectLiteral, Repository } from "typeorm";

export abstract class EntityRepository<T extends ObjectLiteral> {
	protected abstract readonly repository: Repository<T>;

	/**
	 * Find first entity by the given criteria. If entity was not found in the database - throws
	 * @throws {NotFoundException}
	 */
	public async getOneWhere(where: FindOptionsWhere<T>, relations?: FindOptionsRelations<T>) {
		const entity = await this.repository.findOne({
			where,
			relations,
		});

		if (!entity) throw new NotFoundException();
		return entity;
	}

	/** Find each entity by the given criteria */
	public async getWhere(where: FindOptionsWhere<T>, relations?: FindOptionsRelations<T>) {
		return await this.repository.find({ where, relations });
	}

	/**
	 * Update first entity by the given criteria. If entity has not found in the database - throw. Ensure "id" property is not changed
	 * @throws {NotFoundException}
	 */
	public async updateOneWhere(where: FindOptionsWhere<T>, partialEntity: Partial<T>) {
		const entity = await this.getOneWhere(where);

		const updatedEntity = Object.assign(entity, partialEntity, {
			id: (entity.id as number | string) || undefined, // ensure id won't change
		});

		return await this.repository.save(updatedEntity);
	}

	/**
	 * Delete entities by the given criteria. Does not check if entity exist in the database
	 */
	public async deleteOneWhere(where: FindOptionsWhere<T>) {
		await this.repository.delete(where);

		return {};
	}
}
