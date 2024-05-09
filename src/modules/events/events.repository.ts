import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, FindOptionsWhere, Repository } from "typeorm";

import { EntityRepository } from "src/common/entity.repository";
import { EventPeriodEntity } from "src/entities/event-period.entity";
import { EventEntity } from "src/entities/event.entity";

import { CreateEventDto } from "./dtos/create-event.dto";

@Injectable()
export class EventsRepository extends EntityRepository<EventEntity> {
	constructor(
		@InjectRepository(EventEntity)
		protected readonly repository: Repository<EventEntity>,
		@InjectRepository(EventPeriodEntity)
		private readonly periodsRepository: Repository<EventPeriodEntity>
	) {
		super();
	}

	public async create(dto: CreateEventDto & DeepPartial<EventEntity>) {
		const eventPeriod = new EventPeriodEntity();
		Object.assign(eventPeriod, dto.period);

		return await this.repository.save(dto);
	}

	public async updateOneWhere(
		where: FindOptionsWhere<EventEntity>,
		partialEntity: DeepPartial<EventEntity>
	) {
		const event = await this.getOneWhere(where);

		Object.assign(event, partialEntity, {
			period: partialEntity.period
				? Object.assign(event.period, partialEntity.period)
				: event.period,
		});

		return await this.repository.save(event);
	}
}
