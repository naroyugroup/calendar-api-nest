/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { InjectRepository } from "@nestjs/typeorm";
import { rrulestr } from "rrule";
import { Brackets, IsNull, Not, Repository } from "typeorm";

import { EventEntity } from "src/entities/event.entity";

import { GetEventsByDateRangeDto } from "./dtos/get-events-by-date-range.dto";

export class EventsService {
	constructor(
		@InjectRepository(EventEntity)
		protected readonly repository: Repository<EventEntity>
	) {}

	private async getEventsWithoutRecurrenceBetweenDates(dto: GetEventsByDateRangeDto) {
		const { calendarId, startDate, endDate } = dto;

		return await this.repository
			.createQueryBuilder("event")
			.leftJoinAndSelect("event.period", "period")
			.where("event.calendarId = :calendarId", { calendarId })
			.andWhere("event.recurrenceRule IS NULL")
			.andWhere(
				new Brackets((qb) => {
					qb.where(
						new Brackets((qb) => {
							qb.where("period.startDate BETWEEN :startDate AND :endDate", {
								startDate,
								endDate,
							}).orWhere("period.endDate BETWEEN :startDate AND :endDate", {
								startDate,
								endDate,
							});
						})
					).orWhere(
						new Brackets((qb) => {
							qb.where("period.startDateTime BETWEEN :startDate AND :endDate", {
								startDate,
								endDate,
							}).orWhere("period.endDateTime BETWEEN :startDate AND :endDate", {
								startDate,
								endDate,
							});
						})
					);
				})
			)
			.getMany();
	}

	private extractDateFromISOStamp(stamp: string) {
		return stamp.split("T")[0];
	}

	private parseDateByIsFullDay(date: Date, isFullDay: boolean) {
		const parsedDate = date.toISOString();

		if (isFullDay) return this.extractDateFromISOStamp(parsedDate);
		return parsedDate;
	}

	private parseRecurrenceEvent(event: EventEntity, startDate: Date, endDate: Date) {
		const isFullDayEvent = !!event.period.startDate;
		const eventStartDate = new Date(event.period.startDateTime || event.period.startDate);
		const eventEndDate = new Date(event.period.endDate || event.period.endDateTime);

		const rruleStart = rrulestr(event.recurrenceRule, {
			dtstart: eventStartDate,
		});

		const diffTime = eventEndDate.getTime() - eventStartDate.getTime();

		return rruleStart.between(startDate, endDate).map((date) => {
			{
				const startRecurrenceDate = this.parseDateByIsFullDay(date, isFullDayEvent);
				const endRecurrenceDate = this.parseDateByIsFullDay(
					new Date(date.getTime() + diffTime),
					isFullDayEvent
				);

				const clone: EventEntity = structuredClone(event);

				clone.period[isFullDayEvent ? "startDate" : "startDateTime"] =
					startRecurrenceDate as unknown as Date;

				clone.period[isFullDayEvent ? "endDate" : "endDateTime"] =
					endRecurrenceDate as unknown as Date;

				return clone;
			}
		});
	}

	public async getByDateRange(dto: GetEventsByDateRangeDto) {
		const startDate = new Date(dto.startDate);
		const endDate = new Date(dto.endDate);

		const events: EventEntity[] = [];

		const eventsWithoutRecurrence = await this.getEventsWithoutRecurrenceBetweenDates(dto);
		events.push(...eventsWithoutRecurrence);

		const eventsWithRecurrence = await this.repository.find({
			where: { calendarId: dto.calendarId, recurrenceRule: Not(IsNull()) },
		});

		for (const event of eventsWithRecurrence) {
			events.push(...this.parseRecurrenceEvent(event, startDate, endDate));
		}

		return events;
	}
}
