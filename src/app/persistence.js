import { hydrateSlice, resetDemoData } from './appActions';
import { sanitizeAuth } from '../features/auth/authSlice';
import { sanitizeAppointments } from '../features/appointments/appointmentsSlice';
import { sanitizeCart } from '../features/cart/cartSlice';
import { sanitizeDoctorStatus } from '../features/doctorStatus/doctorStatusSlice';
import { sanitizeInventory } from '../features/inventory/inventorySlice';
import { sanitizeOrders } from '../features/orders/ordersSlice';
import { sanitizePrescriptions } from '../features/prescriptions/prescriptionsSlice';
import { sanitizeProfile } from '../features/profile/profileSlice';
import { clearAllStored, parseEnvelope, readStored, sliceNameFromKey, writeStored } from '../utils/storage';

/** Slices saved to localStorage, each with a sanitizer that rejects malformed data. */
const PERSISTED_SLICES = {
  auth: sanitizeAuth,
  doctorStatus: sanitizeDoctorStatus,
  appointments: sanitizeAppointments,
  cart: sanitizeCart,
  prescriptions: sanitizePrescriptions,
  orders: sanitizeOrders,
  inventory: sanitizeInventory,
  profile: sanitizeProfile,
};

const PERSISTED_KEYS = Object.keys(PERSISTED_SLICES);

function sanitize(key, raw) {
  try {
    return PERSISTED_SLICES[key](raw) ?? undefined;
  } catch {
    return undefined;
  }
}

/** Reads stored slices; anything missing or invalid falls back to fresh demo data. */
export function loadPersistedState() {
  const preloaded = {};
  PERSISTED_KEYS.forEach((key) => {
    const raw = readStored(key);
    if (raw === undefined) return;
    const clean = sanitize(key, raw);
    if (clean) preloaded[key] = clean;
  });
  return preloaded;
}

// Last state reference written per slice; Redux state is immutable so a reference
// check is enough to know whether a slice changed.
const lastSaved = {};

export const persistMiddleware = (store) => (next) => (action) => {
  if (resetDemoData.match(action)) {
    clearAllStored();
    // Storage was wiped, so re-save every slice — including ones kept as-is (the session).
    PERSISTED_KEYS.forEach((key) => delete lastSaved[key]);
  }
  const result = next(action);
  const state = store.getState();

  PERSISTED_KEYS.forEach((key) => {
    if (state[key] === lastSaved[key]) return;
    lastSaved[key] = state[key];
    // Data that just arrived from another tab is already in storage — don't echo it back.
    if (hydrateSlice.match(action) && action.payload.key === key) return;
    writeStored(key, state[key]);
  });
  return result;
};

/**
 * Keeps multiple tabs of this browser in sync via the `storage` event.
 * This is local to one browser profile — nothing is shared with other users or devices.
 */
export function syncAcrossTabs(store) {
  if (typeof window === 'undefined') return () => {};
  const onStorage = (event) => {
    if (event.storageArea !== window.localStorage) return;
    const key = sliceNameFromKey(event.key);
    if (!key || !PERSISTED_SLICES[key] || event.newValue === null) return;
    const clean = sanitize(key, parseEnvelope(event.newValue));
    if (clean) store.dispatch(hydrateSlice(key, clean));
  };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}
