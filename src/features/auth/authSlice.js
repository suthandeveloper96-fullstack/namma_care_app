import { createSlice } from '@reduxjs/toolkit';
import { isIsoDate, isPlainObject } from '../../utils/storage';
import { normalizePhone, validatePhone } from '../../utils/validation';

// DEMO login only: there is no backend, no OTP and no password. The mobile number is checked
// for a valid Indian format and remembered in this browser so pages can require a session.
const signedOut = () => ({ phone: null, loggedInAt: null });

const authSlice = createSlice({
  name: 'auth',
  initialState: signedOut,
  reducers: {
    loggedIn: {
      reducer(state, { payload }) {
        state.phone = payload.phone;
        state.loggedInAt = payload.at;
      },
      prepare(phone) {
        return { payload: { phone: normalizePhone(phone), at: new Date().toISOString() } };
      },
    },
    loggedOut: signedOut,
  },
});

export const { loggedIn, loggedOut } = authSlice.actions;
export default authSlice.reducer;

export const selectSession = (state) => state.auth;
export const selectIsLoggedIn = (state) => Boolean(state.auth.phone);

export function sanitizeAuth(raw) {
  if (!isPlainObject(raw)) return null;
  if (!raw.phone) return signedOut();
  if (validatePhone(raw.phone) || !isIsoDate(raw.loggedInAt)) return signedOut();
  return { phone: normalizePhone(raw.phone), loggedInAt: raw.loggedInAt };
}
