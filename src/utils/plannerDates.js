const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const makeId = () => crypto.randomUUID();

export function parseDateParts(dateStr) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return null;
  return { year, month, day };
}

export function toUtcTime(dateStr) {
  const parts = parseDateParts(dateStr);
  if (!parts) return null;
  return Date.UTC(parts.year, parts.month - 1, parts.day);
}

export function daysBetweenDates(startDate, endDate) {
  const startTime = toUtcTime(startDate);
  const endTime = toUtcTime(endDate);
  if (startTime === null || endTime === null || endTime < startTime) return 1;
  return Math.floor((endTime - startTime) / MS_PER_DAY) + 1;
}

export function addDateDays(dateStr, amount) {
  const startTime = toUtcTime(dateStr);
  if (startTime === null) return null;
  const date = new Date(startTime + amount * MS_PER_DAY);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function buildDays(startDate, endDate, currentDays) {
  const count = startDate && endDate ? daysBetweenDates(startDate, endDate) : 1;
  return Array.from({ length: count }, (_, index) => {
    const existing = currentDays[index];
    return {
      id: existing?.id || makeId(),
      day_number: index + 1,
      date: startDate ? addDateDays(startDate, index) : existing?.date || null,
      start_hour: existing?.start_hour ?? 8,
      end_hour: existing?.end_hour ?? 20,
      activities: existing?.activities || [],
    };
  });
}
