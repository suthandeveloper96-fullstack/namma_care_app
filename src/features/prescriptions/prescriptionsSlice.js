import { createSlice } from '@reduxjs/toolkit';
import { createSeedPrescriptions } from '../../data/orders';
import { getPharmacyById } from '../../data/pharmacies';
import { isIsoDate, isNonEmptyString, isPlainObject } from '../../utils/storage';

// Only file METADATA is stored. The file itself never leaves the browser tab and is not
// persisted — this prototype must not collect real medical documents.
const STATUSES = ['pending', 'approved', 'rejected'];

const prescriptionsSlice = createSlice({
  name: 'prescriptions',
  initialState: () => ({ items: createSeedPrescriptions(new Date()) }),
  reducers: {
    prescriptionSubmitted(state, { payload }) {
      state.items.push(payload);
    },
    prescriptionReviewed: {
      reducer(state, { payload: { id, decision, note, at } }) {
        const rx = state.items.find((p) => p.id === id);
        if (!rx || rx.status !== 'pending' || !['approved', 'rejected'].includes(decision)) return;
        rx.status = decision;
        rx.reviewNote = note;
        rx.reviewedAt = at;
      },
      prepare({ id, decision, note = '' }) {
        return { payload: { id, decision, note, at: new Date().toISOString() } };
      },
    },
    prescriptionRemoved(state, { payload: id }) {
      state.items = state.items.filter((p) => p.id !== id);
    },
  },
});

export const { prescriptionSubmitted, prescriptionReviewed, prescriptionRemoved } = prescriptionsSlice.actions;
export default prescriptionsSlice.reducer;

export const selectPrescriptions = (state) => state.prescriptions.items;
export const selectPrescriptionById = (id) => (state) =>
  id ? state.prescriptions.items.find((p) => p.id === id) ?? null : null;

export function sanitizePrescriptions(raw) {
  if (!isPlainObject(raw) || !Array.isArray(raw.items)) return null;
  return {
    items: raw.items.filter(
      (p) =>
        isPlainObject(p) &&
        isNonEmptyString(p.id) &&
        getPharmacyById(p.pharmacyId) &&
        STATUSES.includes(p.status) &&
        isNonEmptyString(p.fileName) &&
        Array.isArray(p.medicineIds) &&
        isIsoDate(p.submittedAt),
    ),
  };
}
