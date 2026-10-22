import { timeToMinutes } from './date';

export function isOpenAt(hours, date = new Date()) {
  if (!hours) return false;
  if (hours.open24h) return true;
  const minutes = date.getHours() * 60 + date.getMinutes();
  return minutes >= timeToMinutes(hours.open) && minutes < timeToMinutes(hours.close);
}
