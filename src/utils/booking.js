import { addDays, combineDateTime, minutesToTime, parseDateKey, startOfDay, timeToMinutes, toDateKey } from './date';

export const BOOKING_WINDOW_DAYS = 14;
/** Slots starting sooner than this are treated as past and cannot be booked. */
export const MIN_LEAD_MINUTES = 15;

export const APPOINTMENT_STATUS = {
  booked: { label: 'Booked', tone: 'info' },
  completed: { label: 'Completed', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
  no_show: { label: 'Missed', tone: 'warning' },
};

export const isActiveAppointment = (appointment) => appointment.status === 'booked';

export function worksOn(doctor, date) {
  return doctor.schedule.days.includes(date.getDay());
}

const slotCache = new WeakMap();

export function generateSlotTimes(doctor) {
  if (slotCache.has(doctor)) return slotCache.get(doctor);
  const { sessions, slotMinutes } = doctor.schedule;
  const times = sessions.flatMap(({ start, end }) => {
    const result = [];
    for (let t = timeToMinutes(start); t + slotMinutes <= timeToMinutes(end); t += slotMinutes) {
      result.push(minutesToTime(t));
    }
    return result;
  });
  slotCache.set(doctor, times);
  return times;
}

/** Every calendar date inside the booking window, starting today. */
export function getWindowDates(now = new Date(), windowDays = BOOKING_WINDOW_DAYS) {
  const start = startOfDay(now);
  return Array.from({ length: windowDays }, (_, i) => toDateKey(addDays(start, i)));
}

export function getBookableDates(doctor, now = new Date()) {
  return getWindowDates(now).filter((key) => worksOn(doctor, parseDateKey(key)));
}

function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// Simulates slots already taken by other (imaginary) patients so the grid looks realistic.
// Deterministic, so the same slot stays taken across reloads.
export function isHeldByOthers(doctorId, dateKey, time) {
  return hashString(`${doctorId}|${dateKey}|${time}`) % 100 < 22;
}

export function findConflict(appointments, { doctorId, date, time }) {
  return (
    appointments.find(
      (a) => isActiveAppointment(a) && a.doctorId === doctorId && a.date === date && a.time === time,
    ) ?? null
  );
}

function isTooSoon(dateKey, time, now) {
  const at = combineDateTime(dateKey, time);
  return !at || at.getTime() < now.getTime() + MIN_LEAD_MINUTES * 60000;
}

/**
 * Slot states: free | past | booked (other patient) | yours (own active booking).
 */
export function getSlotsForDate(doctor, dateKey, appointments, now = new Date()) {
  const date = parseDateKey(dateKey);
  if (!date || !worksOn(doctor, date)) return [];
  return generateSlotTimes(doctor).map((time) => {
    if (isTooSoon(dateKey, time, now)) return { time, state: 'past' };
    const existing = findConflict(appointments, { doctorId: doctor.id, date: dateKey, time });
    if (existing) return { time, state: existing.owner === 'me' ? 'yours' : 'booked' };
    if (isHeldByOthers(doctor.id, dateKey, time)) return { time, state: 'booked' };
    return { time, state: 'free' };
  });
}

/** Earliest free slot within the booking window, optionally restricted to one date. */
export function findNextFreeSlot(doctor, appointments, now = new Date(), { onDate } = {}) {
  const dates = onDate ? [onDate] : getBookableDates(doctor, now);
  for (const date of dates) {
    const slot = getSlotsForDate(doctor, date, appointments, now).find((s) => s.state === 'free');
    if (slot) return { date, time: slot.time };
  }
  return null;
}

/** Full server-style check, run again right before a booking is saved. */
export function checkSlotBookable({ doctor, date, time, appointments, now = new Date() }) {
  if (!doctor) return { ok: false, reason: 'This doctor could not be found.' };
  const day = parseDateKey(date);
  if (!day) return { ok: false, reason: 'Choose a valid appointment date.' };
  if (!getWindowDates(now).includes(date)) {
    return { ok: false, reason: `Appointments can be booked from today up to ${BOOKING_WINDOW_DAYS} days ahead.` };
  }
  if (!worksOn(doctor, day)) return { ok: false, reason: 'The doctor does not consult on this day.' };
  if (!generateSlotTimes(doctor).includes(time)) return { ok: false, reason: 'Choose one of the listed time slots.' };
  if (isTooSoon(date, time, now)) return { ok: false, reason: 'This time has already passed. Choose a later slot.' };
  if (findConflict(appointments, { doctorId: doctor.id, date, time })) {
    return { ok: false, reason: 'This slot was just booked. Please choose another time.' };
  }
  if (isHeldByOthers(doctor.id, date, time)) return { ok: false, reason: 'This slot is not available.' };
  return { ok: true, reason: '' };
}

export function appointmentDate(appointment) {
  return combineDateTime(appointment.date, appointment.time);
}

export function isUpcoming(appointment, now = new Date()) {
  const at = appointmentDate(appointment);
  return isActiveAppointment(appointment) && at && at.getTime() > now.getTime();
}

export function canCancelAppointment(appointment, now = new Date()) {
  return isUpcoming(appointment, now);
}

/** Splits the patient's own appointments into upcoming / past / cancelled buckets. */
export function groupAppointments(appointments, now) {
  const mine = appointments.filter((a) => a.owner === 'me');
  const byTime = (a, b) => appointmentDate(a) - appointmentDate(b);
  return {
    upcoming: mine.filter((a) => isUpcoming(a, now)).sort(byTime),
    past: mine.filter((a) => a.status !== 'cancelled' && !isUpcoming(a, now)).sort((a, b) => byTime(b, a)),
    cancelled: mine.filter((a) => a.status === 'cancelled').sort((a, b) => byTime(b, a)),
  };
}
