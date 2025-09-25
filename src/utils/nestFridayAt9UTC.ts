import { DateTime } from 'luxon';

export function getNextPreferredSendTime(
  timezone?: string,
  preferredDay = 5,
): Date {
  let tz = timezone || 'America/New_York';
  let now = DateTime.now().setZone(tz);

  if (!now.isValid) {
    console.log(`Invalid timezone "${tz}", falling back to America/New_York`);
    tz = 'America/New_York';
    now = DateTime.now().setZone(tz);
  }

  let target = now.set({ hour: 9, minute: 0, second: 0, millisecond: 0 });

  if (
    now.weekday > preferredDay ||
    (now.weekday === preferredDay && now.hour >= 9)
  ) {
    const daysToAdd = (7 - now.weekday + preferredDay) % 7 || 7;
    target = target.plus({ days: daysToAdd });
  } else {
    const daysToAdd = (preferredDay - now.weekday + 7) % 7;
    target = target.plus({ days: daysToAdd });
  }

  return target.toUTC().toJSDate();
}
