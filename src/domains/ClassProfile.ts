export interface ClassProfile {
  id: string;
  name: string;
  grade?: string;
}

export function isValidClassProfile(data: any): data is ClassProfile {
  return (
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    typeof data.name === 'string'
  );
}
