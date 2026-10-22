import { createSlice } from '@reduxjs/toolkit';
import { createSeedOrders } from '../../data/orders';
import { getPharmacyById } from '../../data/pharmacies';
import { ORDER_STATUS, canTransition } from '../../utils/orderStatus';
import { isIsoDate, isNonEmptyString, isPlainObject } from '../../utils/storage';

const ordersSlice = createSlice({
  name: 'orders',
  initialState: () => ({ items: createSeedOrders(new Date()) }),
  reducers: {
    orderAdded(state, { payload }) {
      state.items.unshift(payload);
    },
    orderStatusChanged: {
      reducer(state, { payload: { id, status, note, actor, at } }) {
        const order = state.items.find((o) => o.id === id);
        if (!order || !canTransition(order.status, status)) return;
        order.status = status;
        order.updatedAt = at;
        order.history.push({ status, at, actor, ...(note ? { note } : {}) });
      },
      prepare({ id, status, note = '', actor = 'pharmacy' }) {
        return { payload: { id, status, note, actor, at: new Date().toISOString() } };
      },
    },
  },
});

export const { orderAdded, orderStatusChanged } = ordersSlice.actions;
export default ordersSlice.reducer;

export const selectAllOrders = (state) => state.orders.items;
export const selectOrderById = (id) => (state) => state.orders.items.find((o) => o.id === id) ?? null;

function isValidOrder(o) {
  return (
    isPlainObject(o) &&
    isNonEmptyString(o.id) &&
    isNonEmptyString(o.ref) &&
    ['me', 'sample'].includes(o.owner) &&
    getPharmacyById(o.pharmacyId) &&
    Boolean(ORDER_STATUS[o.status]) &&
    Array.isArray(o.items) &&
    o.items.length > 0 &&
    o.items.every((i) => isPlainObject(i) && isNonEmptyString(i.name) && Number.isFinite(i.qty) && Number.isFinite(i.price)) &&
    Number.isFinite(o.total) &&
    isPlainObject(o.address) &&
    Array.isArray(o.history) &&
    o.history.length > 0 &&
    o.history.every((h) => isPlainObject(h) && ORDER_STATUS[h.status] && isIsoDate(h.at)) &&
    isIsoDate(o.createdAt)
  );
}

// Sample orders that earlier versions pre-filled for the user; dropped from saved data on load.
const RETIRED_SEED_ORDER_IDS = new Set(['ord-seed-delivered']);

export function sanitizeOrders(raw) {
  if (!isPlainObject(raw) || !Array.isArray(raw.items)) return null;
  return { items: raw.items.filter((o) => isValidOrder(o) && !RETIRED_SEED_ORDER_IDS.has(o.id)) };
}
