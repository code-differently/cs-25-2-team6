import { DomainValidationError } from './domain-errors';

export class Student {
  public readonly id: string;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly buildingIds: string[];

  constructor(params: { id: string; firstName: string; lastName: string; buildingIds?: string[] }) {
    const id = params.id?.trim();
    const firstName = params.firstName?.trim();
    const lastName = params.lastName?.trim();

    if (!id) throw new DomainValidationError('Student.id must be non-empty');
    if (!firstName) throw new DomainValidationError('Student.firstName must be non-empty');
    if (!lastName) throw new DomainValidationError('Student.lastName must be non-empty');

    // Only allow students access to MAIN
    const allowedBuildings = ['MAIN'];
    const buildingIds = (params.buildingIds || []).filter(b => allowedBuildings.includes(b));
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.buildingIds = buildingIds.length > 0 ? buildingIds : ['MAIN'];
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
