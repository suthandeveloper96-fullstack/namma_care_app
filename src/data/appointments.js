import { getDoctorById } from './doctors';
import { addDays, toDateKey } from '../utils/date';
import { getBookableDates, getSlotsForDate } from '../utils/booking';

// Sample appointments created the first time the demo runs in a browser.
// owner "me" → shown in My Appointments; owner "sample" → imaginary patients that
// only appear in the provider dashboard so it has realistic content.

const SAMPLE_PATIENTS = [
  { name: 'Murugan S.', age: '54', phone: '9000000101' },
  { name: 'Janani K.', age: '29', phone: '9000000102' },
  { name: 'Abdul R.', age: '41', phone: '9000000103' },
  { name: 'Selvi M.', age: '67', phone: '9000000104' },
  { name: 'Rohan P.', age: '8', phone: '9000000105' },
  { name: 'Deepa V.', age: '35', phone: '9000000106' },
];

function firstFreeSlot(doctor, appointments, now, minDaysAhead) {
  const earliest = toDateKey(addDays(now, minDaysAhead));
  for (const date of getBookableDates(doctor, now).filter((d) => d >= earliest)) {
    const slot = getSlotsForDate(doctor, date, appointments, now).find((s) => s.state === 'free');
    if (slot) return { date, time: slot.time };
  }
  return null;
}

function makeAppointment({ id, ref, owner, doctorId, slot, patient, reason = '', status = 'booked', createdAt }) {
  const doctor = getDoctorById(doctorId);
  return {
    id,
    ref,
    owner,
    doctorId,
    hospitalId: doctor.hospitalId,
    date: slot.date,
    time: slot.time,
    patient,
    reason,
    status,
    createdAt,
    updatedAt: createdAt,
  };
}

export function createSeedAppointments(now = new Date()) {
  const created = new Date(now.getTime() - 2 * 86400000).toISOString();
  const list = [];

  const upcomingSlot = firstFreeSlot(getDoctorById('doc-kavitha-ramanathan'), list, now, 2);
  if (upcomingSlot) {
    list.push(
      makeAppointment({
        id: 'apt-seed-upcoming',
        ref: 'NC-APT-DEMO-K7QX',
        owner: 'me',
        doctorId: 'doc-kavitha-ramanathan',
        slot: upcomingSlot,
        patient: { name: 'Demo Patient', age: '32', phone: '9000000001' },
        reason: 'Routine follow-up',
        createdAt: created,
      }),
    );
  }

  list.push(
    makeAppointment({
      id: 'apt-seed-completed',
      ref: 'NC-APT-DEMO-3MRT',
      owner: 'me',
      doctorId: 'doc-revathi-murugesan',
      slot: { date: toDateKey(addDays(now, -9)), time: '10:00' },
      patient: { name: 'Demo Patient', age: '32', phone: '9000000001' },
      status: 'completed',
      createdAt: new Date(now.getTime() - 12 * 86400000).toISOString(),
    }),
    makeAppointment({
      id: 'apt-seed-cancelled',
      ref: 'NC-APT-DEMO-9PLW',
      owner: 'me',
      doctorId: 'doc-meenakshi-sundaram',
      slot: { date: toDateKey(addDays(now, -3)), time: '09:15' },
      patient: { name: 'Demo Child', age: '6', phone: '9000000001' },
      status: 'cancelled',
      createdAt: new Date(now.getTime() - 6 * 86400000).toISOString(),
    }),
  );

  const providerSamples = [
    'doc-kavitha-ramanathan',
    'doc-arun-selvaraj',
    'doc-karthik-balasubramanian',
    'doc-nandhini-elangovan',
    'doc-lakshmi-narayanan',
    'doc-senthil-arumugam',
  ];
  providerSamples.forEach((doctorId, i) => {
    const slot = firstFreeSlot(getDoctorById(doctorId), list, now, i % 2);
    if (!slot) return;
    list.push(
      makeAppointment({
        id: `apt-seed-sample-${i + 1}`,
        ref: `NC-APT-DEMO-S${i + 1}`,
        owner: 'sample',
        doctorId,
        slot,
        patient: SAMPLE_PATIENTS[i],
        reason: 'Sample booking',
        createdAt: created,
      }),
    );
  });

  return list;
}
