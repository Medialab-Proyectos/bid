import { FormControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AbstractControl } from '@angular/forms';
import moment from 'moment';

export const DEADLINE_MINIMUM_DAYS = 14;

export function eoiLimitDeadlineValidator(
  noticePublicationDate?: string,
  days = 14
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const eoiLimitDateControl = control as FormControl;
    const controlValue: moment.Moment = eoiLimitDateControl.value;
    const fourteenDaysFromDate = moment(
      noticePublicationDate ? moment(noticePublicationDate) : moment.now()
    ).add(days, 'days');

    if (!controlValue) return null;

    return controlValue.isBefore(fourteenDaysFromDate, 'days')
      ? noticePublicationDate
        ? { invalidDeadlinePublication: true }
        : { invalidDeadline: true }
      : null;
  };
}

export function endHourValidator(startHourControl: FormControl): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const endHourControl = control as FormControl;

    const startTime = startHourControl.value;
    const endTime = endHourControl.value;

    if (!startTime || !endTime) {
      return null;
    }

    const [startHour, startMinute] = startTime.split(':');
    const [endHour, endMinute] = endTime.split(':');

    const startTimeMoment = moment()
      .set('hour', Number(startHour))
      .set('minute', Number(startMinute));

    const endTimeMoment = moment()
      .set('hour', Number(endHour))
      .set('minute', Number(endMinute));

    if (endTimeMoment.isBefore(startTimeMoment)) {
      return { endHourInvalid: true };
    }

    return null;
  };
}

export function noEmptyStringValidator(maxLength: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const parser = new DOMParser();
    const doc = parser.parseFromString(value, 'text/html');
    const length = doc.body.textContent.replace(/\s/g, '').trim().length;
    if (length > maxLength) {
      return { maxLength: true };
    }
    return null;
  };
}
