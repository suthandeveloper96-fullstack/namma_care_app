import { createSlice } from '@reduxjs/toolkit';
import { LISTING_INDEX, STATIC_LISTINGS } from '../../data/pharmacies';
import { listingKey } from '../../utils/inventory';
import { isPlainObject } from '../../utils/storage';

const MAX_STOCK = 9999;

function buildSeed() {
  const byKey = {};
  STATIC_LISTINGS.forEach((l) => {
    byKey[listingKey(l.pharmacyId, l.medicineId)] = { stock: l.initialStock, listed: true };
  });
  return { byKey };
}

const clampStock = (n) => Math.min(MAX_STOCK, Math.max(0, Math.round(n)));

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: buildSeed,
  reducers: {
    stockAdjusted(state, { payload: { pharmacyId, medicineId, delta } }) {
      const entry = state.byKey[listingKey(pharmacyId, medicineId)];
      if (entry) entry.stock = clampStock(entry.stock + delta);
    },
    stockSet(state, { payload: { pharmacyId, medicineId, stock } }) {
      const entry = state.byKey[listingKey(pharmacyId, medicineId)];
      if (entry && Number.isFinite(stock)) entry.stock = clampStock(stock);
    },
    listingToggled(state, { payload: { pharmacyId, medicineId } }) {
      const entry = state.byKey[listingKey(pharmacyId, medicineId)];
      if (entry) entry.listed = !entry.listed;
    },
  },
});

export const { stockAdjusted, stockSet, listingToggled } = inventorySlice.actions;
export default inventorySlice.reducer;

export const selectInventory = (state) => state.inventory;

export function sanitizeInventory(raw) {
  if (!isPlainObject(raw) || !isPlainObject(raw.byKey)) return null;
  const clean = buildSeed();
  Object.entries(raw.byKey).forEach(([key, entry]) => {
    if (!LISTING_INDEX.has(key) || !isPlainObject(entry) || !Number.isFinite(entry.stock)) return;
    clean.byKey[key] = { stock: clampStock(entry.stock), listed: entry.listed !== false };
  });
  return clean;
}
