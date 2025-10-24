export interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  grade?: string;
}

export function isValidStudentProfile(data: any): data is StudentProfile {
  return (
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    typeof data.firstName === 'string' &&
    typeof data.lastName === 'string'
  );
}
