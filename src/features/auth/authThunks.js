import { loggedIn, loggedOut } from './authSlice';
import { profileUpdated } from '../profile/profileSlice';
import { normalizePhone, validatePhone } from '../../utils/validation';

/** Validates the mobile number and starts a demo session. Returns { ok } or { ok: false, error }. */
export const loginWithMobile = (rawPhone) => (dispatch) => {
  const error = validatePhone(rawPhone);
  if (error) return { ok: false, error };
  const phone = normalizePhone(rawPhone);
  dispatch(loggedIn(phone));
  // Prefill bookings and deliveries with the number the user signed in with.
  dispatch(profileUpdated({ phone }));
  return { ok: true, phone };
};

export const logout = () => (dispatch) => {
  dispatch(loggedOut());
};
