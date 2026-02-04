import { DateTime } from 'luxon';

const USER_TZ = 'America/New_York';

export function weekStartETJS(
  now: Date = new Date(),
  userTimeZone: string = USER_TZ,
): Date {
  // Use "start of ISO week" (Monday) in ET
  return DateTime.fromJSDate(now, { zone: userTimeZone })
    .startOf('week') // Luxon: ISO week => Monday start
    .toJSDate();
}

export function startOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}
