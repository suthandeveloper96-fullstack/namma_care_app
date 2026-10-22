import { createSlice } from '@reduxjs/toolkit';
import { getMedicineById } from '../../data/medicines';
import { getPharmacyById } from '../../data/pharmacies';
import { MAX_QTY_PER_ITEM } from '../../utils/inventory';
import { isPlainObject } from '../../utils/storage';

const emptyCart = () => ({ pharmacyId: null, items: [], prescriptionId: null });

function dropPrescriptionIfUnneeded(state) {
  const needsRx = state.items.some((i) => getMedicineById(i.medicineId)?.rxRequired);
  if (!needsRx) state.prescriptionId = null;
  if (!state.items.length) state.pharmacyId = null;
}

// The cart holds items from a single pharmacy; switching pharmacies is confirmed in the UI first.
const cartSlice = createSlice({
  name: 'cart',
  initialState: emptyCart,
  reducers: {
    itemAdded(state, { payload: { pharmacyId, medicineId, qty } }) {
      if (state.pharmacyId && state.pharmacyId !== pharmacyId) {
        Object.assign(state, emptyCart());
      }
      state.pharmacyId = pharmacyId;
      const existing = state.items.find((i) => i.medicineId === medicineId);
      if (existing) existing.qty = Math.min(MAX_QTY_PER_ITEM, existing.qty + qty);
      else state.items.push({ medicineId, qty });
    },
    quantityChanged(state, { payload: { medicineId, qty } }) {
      const item = state.items.find((i) => i.medicineId === medicineId);
      if (!item) return;
      if (qty <= 0) state.items = state.items.filter((i) => i.medicineId !== medicineId);
      else item.qty = Math.min(MAX_QTY_PER_ITEM, qty);
      dropPrescriptionIfUnneeded(state);
    },
    itemRemoved(state, { payload: medicineId }) {
      state.items = state.items.filter((i) => i.medicineId !== medicineId);
      dropPrescriptionIfUnneeded(state);
    },
    prescriptionAttached(state, { payload: prescriptionId }) {
      state.prescriptionId = prescriptionId;
    },
    prescriptionDetached(state) {
      state.prescriptionId = null;
    },
    cartCleared: emptyCart,
  },
});

export const { itemAdded, quantityChanged, itemRemoved, prescriptionAttached, prescriptionDetached, cartCleared } =
  cartSlice.actions;
export default cartSlice.reducer;

export const selectCart = (state) => state.cart;
export const selectCartCount = (state) => state.cart.items.reduce((sum, i) => sum + i.qty, 0);

export function sanitizeCart(raw) {
  if (!isPlainObject(raw) || !Array.isArray(raw.items)) return null;
  if (raw.pharmacyId && !getPharmacyById(raw.pharmacyId)) return emptyCart();
  const items = raw.items
    .filter((i) => isPlainObject(i) && getMedicineById(i.medicineId) && Number.isInteger(i.qty) && i.qty > 0)
    .map((i) => ({ medicineId: i.medicineId, qty: Math.min(MAX_QTY_PER_ITEM, i.qty) }));
  return {
    pharmacyId: items.length ? raw.pharmacyId ?? null : null,
    items,
    prescriptionId: typeof raw.prescriptionId === 'string' ? raw.prescriptionId : null,
  };
}
