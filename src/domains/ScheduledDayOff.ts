import { DomainValidationError, InvalidDateError } from './domain-errors';
import { isDateISO } from './dateUtils';

export enum ScheduledDayOffReason {
  HOLIDAY = 'HOLIDAY',
  PROFESSIONAL_DEVELOPMENT = 'PROFESSIONAL_DEVELOPMENT',
  REPORT_CARD_CONFERENCES = 'REPORT_CARD_CONFERENCES',
  OTHER = 'OTHER',
}

export class ScheduledDayOff {
  public readonly dateISO: string;
  public readonly reason: ScheduledDayOffReason;

  constructor(params: { dateISO: string; reason: ScheduledDayOffReason }) {
    if (!isDateISO(params.dateISO)) throw new InvalidDateError(params.dateISO);
    if (!params.reason) throw new DomainValidationError('ScheduledDayOff.reason is required');
    this.dateISO = params.dateISO;
    this.reason = params.reason;
  }
}
