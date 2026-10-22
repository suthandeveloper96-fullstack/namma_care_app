import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { hydrateSlice, resetDemoData } from './appActions';
import { loadPersistedState, persistMiddleware, syncAcrossTabs } from './persistence';
import auth from '../features/auth/authSlice';
import appointments from '../features/appointments/appointmentsSlice';
import cart from '../features/cart/cartSlice';
import doctorStatus from '../features/doctorStatus/doctorStatusSlice';
import inventory from '../features/inventory/inventorySlice';
import orders from '../features/orders/ordersSlice';
import prescriptions from '../features/prescriptions/prescriptionsSlice';
import profile from '../features/profile/profileSlice';
import ui from '../features/ui/uiSlice';

const appReducer = combineReducers({
  auth,
  doctorStatus,
  appointments,
  cart,
  prescriptions,
  orders,
  inventory,
  profile,
  ui,
});

function rootReducer(state, action) {
  if (resetDemoData.match(action)) {
    // Rebuild every slice from fresh demo seed data, but keep the user signed in.
    const fresh = appReducer(undefined, action);
    return state ? { ...fresh, auth: state.auth } : fresh;
  }
  if (hydrateSlice.match(action) && state) {
    const { key, data } = action.payload;
    return appReducer({ ...state, [key]: data }, action);
  }
  return appReducer(state, action);
}

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: loadPersistedState(),
  // Dev-only invariant checks: the default 32 ms warning threshold is noisy on slower machines.
  middleware: (getDefault) =>
    getDefault({ immutableCheck: { warnAfter: 300 }, serializableCheck: { warnAfter: 300 } }).concat(persistMiddleware),
});

// Write any freshly generated seed data so a reload restores the same demo state.
store.dispatch({ type: 'app/init' });
syncAcrossTabs(store);
