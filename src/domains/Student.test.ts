import { Student } from './Student';
import { DomainValidationError } from './domain-errors';

describe('Student', () => {
  it('should create a student with valid names and id', () => {
    const s = new Student({ id: '1', firstName: 'John', lastName: 'Doe' });
    expect(s.id).toBe('1');
    expect(s.firstName).toBe('John');
    expect(s.lastName).toBe('Doe');
    expect(s.buildingIds).toEqual(['MAIN']);
  });

  it('should trim whitespace from names', () => {
    const s = new Student({ id: '2', firstName: '  Jane ', lastName: ' Doe  ' });
    expect(s.firstName).toBe('Jane');
    expect(s.lastName).toBe('Doe');
  });

  it('should throw error for empty first or last name', () => {
    expect(() => new Student({ id: '3', firstName: '', lastName: 'Doe' })).toThrow(DomainValidationError);
    expect(() => new Student({ id: '3', firstName: 'Jane', lastName: '' })).toThrow(DomainValidationError);
  });
});
