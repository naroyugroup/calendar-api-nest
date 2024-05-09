import { Injectable } from "@nestjs/common";

import { ParticipantRole } from "src/entities/calendar-participant.entity";
import { UsersRepository } from "src/modules/users/users.repository";

import { CalendarParticipantsRepository } from "./calendar-participants.repository";
import { AddParticipantsByEmailDto } from "./dtos/add-participants-by-email.dto";
import { GetAllCalendarParticipantsResultDto } from "./dtos/get-all-calendar-participants.dto";
import {
	OperateParticipantDto,
	OperateParticipantParametersDto,
} from "./dtos/operate-participant.dto";
import { UpdateParticipantRoleByEmailDto } from "./dtos/update-participant-role-by-email.dto";
import { CalendarsRepository } from "../calendars.repository";

@Injectable()
export class CalendarParticipantsService {
	constructor(
		private readonly repository: CalendarParticipantsRepository,
		private readonly calendarsRepository: CalendarsRepository,
		private readonly usersRepository: UsersRepository
	) {}

	public async addParticipantsByEmailList(dto: AddParticipantsByEmailDto) {
		let invitedUsers = await Promise.all(
			dto.participants.map(async (email) => await this.usersRepository.getOneWhere({ email }))
		);

		const calendar = await this.calendarsRepository.getOneWhere({ id: dto.calendarId });
		invitedUsers = invitedUsers.filter((user) => user.id !== calendar.ownerId);

		for (const user of invitedUsers) {
			try {
				// if record already exist, skip creation
				await this.repository.getOneWhere({ userId: user.id, calendarId: dto.calendarId });
			} catch {
				// by default set role as "member"
				await this.repository.create({ userId: user.id, calendarId: dto.calendarId });
			}
		}
	}

	public async getAllCalendarParticipants(dto: OperateParticipantParametersDto) {
		const calendarParticipantRecords = await this.repository.getWhere({
			calendarId: dto.calendarId,
		});

		const calendar = await this.calendarsRepository.getOneWhere({ id: dto.calendarId });
		const owner = await this.usersRepository.getOneWhere({ id: calendar.ownerId });
		this.usersRepository.omitUserSecureFields(owner);

		const participants = await Promise.all(
			calendarParticipantRecords.map(async (record) => {
				const user = await this.usersRepository.getOneWhere({ id: record.userId });
				this.usersRepository.omitUserSecureFields(user);

				return Object.assign(user, {
					role: record.role,
				}) as unknown as GetAllCalendarParticipantsResultDto;
			})
		);
		participants.push(
			Object.assign(owner, {
				role: ParticipantRole.OWNER,
			} as unknown as GetAllCalendarParticipantsResultDto)
		);

		return participants;
	}

	public async updateParticipantRoleByEmail(dto: UpdateParticipantRoleByEmailDto) {
		const user = await this.usersRepository.getOneWhere({ email: dto.email });

		await this.repository.updateOneWhere(
			{ userId: user.id, calendarId: dto.calendarId },
			{ role: dto.role }
		);
	}

	public async removeParticipantByEmail(dto: OperateParticipantDto) {
		const user = await this.usersRepository.getOneWhere({ email: dto.email });

		await this.repository.deleteOneWhere({ userId: user.id, calendarId: dto.calendarId });
	}
}
