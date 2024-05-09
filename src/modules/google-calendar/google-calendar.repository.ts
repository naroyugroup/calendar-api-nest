/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from "@nestjs/common";
import { calendar_v3 } from "googleapis";
import { GaxiosResponse } from "googleapis-common";

import { CalendarEntity } from "src/entities/calendar.entity";
import { EventEntity } from "src/entities/event.entity";

import { CalendarsRepository } from "../calendars/calendars.repository";
import { EventsRepository } from "../events/events.repository";
import { UsersRepository } from "../users/users.repository";

@Injectable()
export class GoogleCalendarRepository {
	constructor(
		private readonly eventsRepository: EventsRepository,
		private readonly calendarsRepository: CalendarsRepository,
		private readonly usersRepository: UsersRepository
	) {}

	public transformLocalEventToGoogleRequestEvent(event: EventEntity) {
		return {
			start: {
				date: event.period.startDate as unknown as string,
				dateTime: event.period.startDateTime as unknown as string,
				timeZone: event.period.startTimezone as unknown as string,
			},
			end: {
				date: event.period.endDate as unknown as string,
				dateTime: event.period.endDateTime as unknown as string,
				timeZone: event.period.endTimezone as unknown as string,
			},
			summary: event.summary,
			description: event.description,
			location: event.location,
			recurrence: [event.recurrenceRule],
			creator: { email: event.creator },
			organizer: { email: event.organizer },
			attendees: event.attendee ? event.attendee.map((at) => ({ email: at })) : undefined,
			created: event.created as unknown as string,
			updated: event.updated as unknown as string,
		};
	}

	public transformGoogleResponseEventToLocalEvent(responseEvent: calendar_v3.Schema$Event) {
		return {
			googleId: responseEvent.id,
			period: {
				startDate: responseEvent.start.date,
				startDateTime: responseEvent.start.dateTime,
				startTimezone: responseEvent.start.timeZone,
				endDate: responseEvent.end.date,
				endDateTime: responseEvent.end.dateTime,
				endTimezone: responseEvent.end.timeZone,
			},
			summary: responseEvent.summary,
			description: responseEvent.description,
			creator: responseEvent.creator.email,
			organizer: responseEvent.organizer.email,
			location: responseEvent.location,
			recurrenceRule: responseEvent.recurrence ? responseEvent.recurrence[0] : undefined,
			attendee: responseEvent.attendees ? responseEvent.attendees.map((at) => at.email) : undefined,
			created: responseEvent.created,
			updated: responseEvent.updated,
		};
	}

	public async getUserTokens(userId: number) {
		const user = await this.usersRepository.getOneWhere({ id: userId });

		return { syncToken: user.googleCalendarSyncToken, refreshToken: user.googleApiRefreshToken };
	}

	public async createEvent(
		calendarApiInstance: calendar_v3.Calendar,
		calendar: CalendarEntity,
		event: EventEntity
	) {
		const createdEvent = await calendarApiInstance.events.insert({
			calendarId: calendar.googleId,
			requestBody: this.transformLocalEventToGoogleRequestEvent(event),
		});

		return await this.eventsRepository.updateOneWhere(
			{ id: event.id },
			{ googleId: createdEvent.data.id }
		);
	}

	public async updateEvent(
		calendarApiInstance: calendar_v3.Calendar,
		calendar: CalendarEntity,
		event: EventEntity
	) {
		await calendarApiInstance.events.update({
			calendarId: calendar.googleId,
			eventId: event.googleId,
			requestBody: this.transformLocalEventToGoogleRequestEvent(event),
		});
	}

	public async createCalendar(calendarApiInstance: calendar_v3.Calendar, calendar: CalendarEntity) {
		const createdCalendar = await calendarApiInstance.calendars.insert({
			requestBody: {
				summary: calendar.summary,
			},
		});

		return await this.calendarsRepository.updateOneWhere(
			{ id: calendar.id },
			{ googleId: createdCalendar.data.id }
		);
	}

	public async updateCalendar(calendarApiInstance: calendar_v3.Calendar, calendar: CalendarEntity) {
		await calendarApiInstance.calendars.update({
			calendarId: calendar.googleId,
			requestBody: { summary: calendar.summary },
		});
	}

	public async synchronizeUserCalendar(
		calendarApiInstance: calendar_v3.Calendar,
		calendar: CalendarEntity
	) {
		const result = await calendarApiInstance.calendars.get({ calendarId: calendar.googleId });

		if (result.status === 404)
			return await this.calendarsRepository.deleteOneWhere({ id: calendar.id });

		await this.calendarsRepository.updateOneWhere(
			{ googleId: result.data.id },
			{ summary: result.data.summary }
		);
	}

	public async synchronizeUserCalendars(
		calendarApiInstance: calendar_v3.Calendar,
		syncToken: string,
		ownerId: number
	) {
		let result: GaxiosResponse<calendar_v3.Schema$CalendarList>;

		try {
			result = result = await calendarApiInstance.calendarList.list({
				syncToken: syncToken,
			});
		} catch (error) {
			// sync token is not valid
			if (error.status === 410) {
				result = result = await calendarApiInstance.calendarList.list({});
			} else throw error;
		}

		for (const calendar of result.data.items) {
			if (calendar.deleted) {
				await this.calendarsRepository.deleteOneWhere({ googleId: calendar.id });
			} else {
				try {
					// throw if not found
					await this.calendarsRepository.updateOneWhere(
						{ googleId: calendar.id },
						{ summary: calendar.summary }
					);
				} catch {
					await this.calendarsRepository.create({
						ownerId,
						googleId: calendar.id,
						summary: calendar.summary,
					} as Pick<CalendarEntity, "ownerId" | "summary">);
				}
			}
		}

		return result.data.nextSyncToken;
	}

	public async synchronizeCalendarEvents(
		calendarApiInstance: calendar_v3.Calendar,
		calendar: CalendarEntity,
		syncToken: string
	) {
		let result: GaxiosResponse<calendar_v3.Schema$Events>;

		try {
			result = await calendarApiInstance.events.list({
				calendarId: calendar.googleId,
				syncToken,
			});
		} catch (error) {
			// sync token is not valid
			if (error.status === 410) {
				result = await calendarApiInstance.events.list({
					calendarId: calendar.googleId,
				});
			} else throw error;
		}

		for (const event of result.data.items) {
			if (event.status === "cancelled") {
				await this.eventsRepository.deleteOneWhere({
					googleId: event.id,
				});
			} else {
				try {
					await this.eventsRepository.updateOneWhere(
						{ googleId: event.id },
						this.transformGoogleResponseEventToLocalEvent(event)
					);
				} catch {
					await this.eventsRepository.create(
						Object.assign(this.transformGoogleResponseEventToLocalEvent(event), {
							calendarId: calendar.id,
						})
					);
				}
			}
		}

		return result.data.nextSyncToken;
	}
}
