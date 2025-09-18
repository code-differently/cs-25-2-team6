export class DomainValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainValidationError';
  }
}

export class InvalidDateError extends DomainValidationError {
  constructor(dateISO: string) {
    super(`Invalid ISO date (YYYY-MM-DD): "${dateISO}"`);
    this.name = 'InvalidDateError';
  }
}
