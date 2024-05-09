import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { EntityRepository } from "src/common/entity.repository";
import { CalendarEntity } from "src/entities/calendar.entity";

import { CreateCalendarDto } from "./dtos/create-calendar.dto";

@Injectable()
export class CalendarsRepository extends EntityRepository<CalendarEntity> {
	constructor(
		@InjectRepository(CalendarEntity)
		protected readonly repository: Repository<CalendarEntity>
	) {
		super();
	}

	public async create(dto: CreateCalendarDto & Partial<CalendarEntity>) {
		return await this.repository.save(dto);
	}
}
