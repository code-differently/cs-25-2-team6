export function isDateISO(dateISO: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) return false;
  const d = new Date(dateISO + 'T00:00:00Z');
  return !Number.isNaN(d.getTime());
}
