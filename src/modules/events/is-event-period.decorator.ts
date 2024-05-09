import {
	ValidatorConstraint,
	ValidatorConstraintInterface,
	registerDecorator,
	ValidationOptions,
} from "class-validator";

import { EventPeriodDto } from "./dtos/event-period.dto";

@ValidatorConstraint({ name: "IsEventPeriod", async: false })
export class MatchConstraint implements ValidatorConstraintInterface {
	validate(period: EventPeriodDto) {
		// if full day, must exist only (start/end)Date field
		const isStartFullDay = period.startDate && !period.startDateTime && !period.startTimezone;
		const isEndFullDay = period.endDate && !period.endDateTime && !period.endTimezone;

		// if regular, must exist only (start/end)DateTime and (start/end)Timezone fields
		const isStartRegular = period.startDateTime && period.startTimezone && !period.startDate;
		const isEndRegular = period.endDateTime && period.endTimezone && !period.endDate;

		const isFullDayEvent = isStartFullDay && isEndFullDay;
		const isRegularEvent = isStartRegular && isEndRegular;

		return isFullDayEvent || isRegularEvent;
	}

	defaultMessage() {
		return "event period is not valid, if full day, must exist only (start/end)Date field, if regular, must exist only (start/end)DateTime and (start/end)Timezone fields";
	}
}

/** Is event period
 * 
 * if full day, must exist only (start/end)Date field, if regular, must exist only (start/end)DateTime and (start/end)Timezone fields
 * @example
 * {
      "startDateTime": "2023-10-10T12:45:00+02:00",
      "startTimezone": "Europe/Prague",
      "endDateTime": "2023-10-10T12:45:00+02:00",
      "endTimezone": "Europe/Prague",
    }
 * {
      "startDate": "2014-10-19",
      "endDate": "2014-10-19",
    }
 */
export function IsEventPeriod(validationOptions?: ValidationOptions) {
	return (object: unknown, propertyName: string) => {
		registerDecorator({
			target: object.constructor,
			propertyName,
			options: validationOptions,
			validator: MatchConstraint,
		});
	};
}
