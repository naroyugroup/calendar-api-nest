import { Injectable } from "@nestjs/common";
import { google } from "googleapis";

import { GoogleCalendarRepository } from "./google-calendar.repository";
import { GoogleNotConnectedError } from "./google-not-connected.error";
import { CalendarsRepository } from "../calendars/calendars.repository";
import { EventsRepository } from "../events/events.repository";
import { UsersRepository } from "../users/users.repository";

@Injectable()
export class GoogleCalendarService {
	constructor(
		private readonly repository: GoogleCalendarRepository,
		private readonly eventsRepository: EventsRepository,
		private readonly calendarsRepository: CalendarsRepository,
		private readonly usersRepository: UsersRepository
	) {}

	private async getCalendarApiInstance(userId: number) {
		const { refreshToken } = await this.repository.getUserTokens(userId);

		if (!refreshToken) throw new GoogleNotConnectedError("User does not connect google");

		const oauth2Client = new google.auth.OAuth2({
			clientId: process.env.GOOGLE_OAUTH2_CLIENT_ID,
			clientSecret: process.env.GOOGLE_OAUTH2_CLIENT_SECRET,
			credentials: {
				refresh_token: refreshToken,
			},
		});

		return google.calendar({ version: "v3", auth: oauth2Client });
	}

	public async upsertCalendar(calendarId: number) {
		const calendar = await this.calendarsRepository.getOneWhere({ id: calendarId });
		const calendarOwner = await this.usersRepository.getOneWhere({ id: calendar.ownerId });

		const calendarApiInstance = await this.getCalendarApiInstance(calendarOwner.id);

		if (calendar.googleId) await this.repository.updateCalendar(calendarApiInstance, calendar);
		else await this.repository.createCalendar(calendarApiInstance, calendar);
	}

	public async deleteCalendar(calendarId: number) {
		const calendar = await this.calendarsRepository.getOneWhere({ id: calendarId });
		const calendarOwner = await this.usersRepository.getOneWhere({ id: calendar.ownerId });

		const calendarApiInstance = await this.getCalendarApiInstance(calendarOwner.id);

		await calendarApiInstance.calendars.delete({ calendarId: calendar.googleId });
	}

	public async upsertEvent(eventId: string) {
		const event = await this.eventsRepository.getOneWhere({ id: eventId });
		const calendar = await this.calendarsRepository.getOneWhere({ id: event.calendarId });
		const eventOwner = await this.usersRepository.getOneWhere({ id: calendar.ownerId });

		const calendarApiInstance = await this.getCalendarApiInstance(eventOwner.id);

		if (!calendar.googleId) {
			const updatedCalendar = await this.repository.createCalendar(calendarApiInstance, calendar);
			calendar.googleId = updatedCalendar.googleId;
		}

		if (event.googleId) await this.repository.updateEvent(calendarApiInstance, calendar, event);
		else await this.repository.createCalendar(calendarApiInstance, calendar);
	}

	public async deleteEvent(eventId: string) {
		const event = await this.eventsRepository.getOneWhere({ id: eventId });
		const calendar = await this.calendarsRepository.getOneWhere({ id: event.calendarId });
		const eventOwner = await this.usersRepository.getOneWhere({ id: calendar.ownerId });

		const calendarApiInstance = await this.getCalendarApiInstance(eventOwner.id);

		// there is no point to delete the event which does not exist or from the calendar which does not exist
		if (calendar.googleId && event.googleId) {
			await calendarApiInstance.events.delete({
				calendarId: calendar.googleId,
				eventId: event.googleId,
			});
		}
	}

	public async synchronizeAllUserResources(userId: number) {
		const { syncToken, refreshToken } = await this.repository.getUserTokens(userId);

		const oauth2Client = new google.auth.OAuth2({
			clientId: process.env.GOOGLE_OAUTH2_CLIENT_ID,
			clientSecret: process.env.GOOGLE_OAUTH2_CLIENT_SECRET,
			credentials: {
				refresh_token: refreshToken,
			},
		});

		const calendarApiInstance = google.calendar({ version: "v3", auth: oauth2Client });

		let nextSyncToken = await this.repository.synchronizeUserCalendars(
			calendarApiInstance,
			syncToken,
			userId
		);

		const calendars = await this.calendarsRepository.getWhere({ ownerId: userId });

		for (const calendar of calendars) {
			if (!calendar.googleId) {
				const updatedCalendar = await this.repository.createCalendar(calendarApiInstance, calendar);

				calendar.googleId = updatedCalendar.googleId;
			}
			nextSyncToken = await this.repository.synchronizeCalendarEvents(
				calendarApiInstance,
				calendar,
				nextSyncToken
			);
		}

		await this.usersRepository.updateOneWhere(
			{ id: userId },
			{ googleCalendarSyncToken: nextSyncToken }
		);
	}

	public async init(ownerId: number) {
		const { refreshToken } = await this.repository.getUserTokens(ownerId);

		const oauth2Client = new google.auth.OAuth2({
			clientId: process.env.GOOGLE_OAUTH2_CLIENT_ID,
			clientSecret: process.env.GOOGLE_OAUTH2_CLIENT_SECRET,
			credentials: {
				refresh_token: refreshToken,
			},
		});

		const calendarApi = google.calendar({ version: "v3", auth: oauth2Client });

		const calendarsList = await calendarApi.calendarList.list();

		for (const calendar of calendarsList.data.items) {
			const createdCalendar = await this.calendarsRepository.create({
				ownerId,
				summary: calendar.summary,
				googleId: calendar.id,
			});

			const eventList = await calendarApi.events.list({ calendarId: calendar.id });

			for (const event of eventList.data.items) {
				await this.eventsRepository.create(
					Object.assign(this.repository.transformGoogleResponseEventToLocalEvent(event), {
						googleId: event.id,
						calendarId: createdCalendar.id,
					})
				);
			}

			await this.usersRepository.updateOneWhere(
				{ id: ownerId },
				{ googleCalendarSyncToken: eventList.data.nextSyncToken }
			);
		}
	}
}
