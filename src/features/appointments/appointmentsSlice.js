import { createSlice } from '@reduxjs/toolkit';
import { createSeedAppointments } from '../../data/appointments';
import { getDoctorById } from '../../data/doctors';
import { APPOINTMENT_STATUS } from '../../utils/booking';
import { isValidTime, parseDateKey } from '../../utils/date';
import { isIsoDate, isNonEmptyString, isPlainObject } from '../../utils/storage';

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState: () => ({ items: createSeedAppointments(new Date()) }),
  reducers: {
    appointmentAdded(state, { payload }) {
      state.items.push(payload);
    },
    appointmentStatusChanged: {
      reducer(state, { payload }) {
        const appointment = state.items.find((a) => a.id === payload.id);
        if (!appointment || appointment.status !== 'booked') return;
        if (!APPOINTMENT_STATUS[payload.status]) return;
        appointment.status = payload.status;
        appointment.updatedAt = payload.at;
        if (payload.status === 'cancelled') appointment.cancelledBy = payload.actor;
      },
      prepare({ id, status, actor = 'patient' }) {
        return { payload: { id, status, actor, at: new Date().toISOString() } };
      },
    },
  },
});

export const { appointmentAdded, appointmentStatusChanged } = appointmentsSlice.actions;
export default appointmentsSlice.reducer;

export const selectAllAppointments = (state) => state.appointments.items;
export const selectAppointmentById = (id) => (state) => state.appointments.items.find((a) => a.id === id) ?? null;

function isValidAppointment(a) {
  return (
    isPlainObject(a) &&
    isNonEmptyString(a.id) &&
    isNonEmptyString(a.ref) &&
    ['me', 'sample'].includes(a.owner) &&
    getDoctorById(a.doctorId) !== null &&
    parseDateKey(a.date) !== null &&
    isValidTime(a.time) &&
    Boolean(APPOINTMENT_STATUS[a.status]) &&
    isPlainObject(a.patient) &&
    isNonEmptyString(a.patient.name) &&
    isIsoDate(a.createdAt)
  );
}

export function sanitizeAppointments(raw) {
  if (!isPlainObject(raw) || !Array.isArray(raw.items)) return null;
  const seen = new Set();
  const items = raw.items.filter((a) => {
    if (!isValidAppointment(a) || seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });
  return { items };
}
