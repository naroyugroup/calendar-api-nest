import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";

import { EntityRepository } from "src/common/entity.repository";
import { CalendarParticipantEntity } from "src/entities/calendar-participant.entity";

import { CalendarParticipantDto } from "./dtos/calendar-participant.dto";

@Injectable()
export class CalendarParticipantsRepository extends EntityRepository<CalendarParticipantEntity> {
	constructor(
		@InjectRepository(CalendarParticipantEntity)
		protected readonly repository: Repository<CalendarParticipantEntity>
	) {
		super();
	}

	public async create(
		dto: Pick<CalendarParticipantDto, "calendarId" | "userId"> & Partial<CalendarParticipantEntity>
	) {
		return await this.repository.save(dto);
	}

	public async updateOneWhere(
		where: FindOptionsWhere<CalendarParticipantEntity>,
		partialEntity: Partial<CalendarParticipantEntity>
	) {
		const entity = await this.getOneWhere(where);

		const updatedEntity = Object.assign(entity, partialEntity, {
			id: entity.id, // ensure id won't change
		});

		return await this.repository.save(updatedEntity);
	}
}
