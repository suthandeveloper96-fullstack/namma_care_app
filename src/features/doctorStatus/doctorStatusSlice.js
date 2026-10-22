import { createSlice } from '@reduxjs/toolkit';
import { DOCTORS, getDoctorById } from '../../data/doctors';
import { STATUS_KEYS } from '../../utils/doctorStatus';
import { isIsoDate, isPlainObject } from '../../utils/storage';

function buildSeed(now = Date.now()) {
  const byId = {};
  DOCTORS.forEach(({ id, seedStatus }) => {
    byId[id] = {
      status: seedStatus.status,
      delayMinutes: seedStatus.delayMinutes ?? 0,
      updatedAt: new Date(now - seedStatus.minutesAgo * 60000).toISOString(),
    };
  });
  return { byId };
}

const doctorStatusSlice = createSlice({
  name: 'doctorStatus',
  initialState: () => buildSeed(),
  reducers: {
    doctorStatusUpdated: {
      reducer(state, { payload }) {
        const { doctorId, status, delayMinutes, at } = payload;
        if (!getDoctorById(doctorId) || !STATUS_KEYS.includes(status)) return;
        state.byId[doctorId] = {
          status,
          delayMinutes: status === 'delayed' ? Math.max(0, Number(delayMinutes) || 0) : 0,
          updatedAt: at,
        };
      },
      prepare({ doctorId, status, delayMinutes = 0 }) {
        return { payload: { doctorId, status, delayMinutes, at: new Date().toISOString() } };
      },
    },
    /** Re-stamps every doctor's sample status as freshly reported. */
    demoStatusesRefreshed: () => buildSeed(),
  },
});

export const { doctorStatusUpdated, demoStatusesRefreshed } = doctorStatusSlice.actions;
export default doctorStatusSlice.reducer;

export const selectStatusById = (state) => state.doctorStatus.byId;

export function sanitizeDoctorStatus(raw) {
  if (!isPlainObject(raw) || !isPlainObject(raw.byId)) return null;
  const clean = buildSeed();
  Object.entries(raw.byId).forEach(([id, entry]) => {
    if (!getDoctorById(id) || !isPlainObject(entry)) return;
    if (!STATUS_KEYS.includes(entry.status) || !isIsoDate(entry.updatedAt)) return;
    clean.byId[id] = {
      status: entry.status,
      delayMinutes: Number.isFinite(entry.delayMinutes) ? entry.delayMinutes : 0,
      updatedAt: entry.updatedAt,
    };
  });
  return clean;
}
