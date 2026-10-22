import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_LOCATION_ID, getLocationById } from '../../data/locations';
import { isPlainObject } from '../../utils/storage';

// Deliberately minimal: no medical history, diagnoses or documents are stored.
const PROFILE_FIELDS = ['name', 'age', 'phone', 'line1', 'city', 'pin'];

const defaultProfile = () => ({
  name: 'Demo Patient',
  age: '32',
  phone: '9000000001',
  line1: '',
  city: 'Chennai',
  pin: '600017',
  locationId: DEFAULT_LOCATION_ID,
});

const profileSlice = createSlice({
  name: 'profile',
  initialState: defaultProfile,
  reducers: {
    profileUpdated(state, { payload }) {
      PROFILE_FIELDS.forEach((field) => {
        if (typeof payload[field] === 'string') state[field] = payload[field].trim();
      });
    },
    locationChanged(state, { payload: locationId }) {
      if (getLocationById(locationId)) state.locationId = locationId;
    },
  },
});

export const { profileUpdated, locationChanged } = profileSlice.actions;
export default profileSlice.reducer;

export const selectProfile = (state) => state.profile;
export const selectLocation = (state) =>
  getLocationById(state.profile.locationId) ?? getLocationById(DEFAULT_LOCATION_ID);

export function sanitizeProfile(raw) {
  if (!isPlainObject(raw)) return null;
  const clean = defaultProfile();
  PROFILE_FIELDS.forEach((field) => {
    if (typeof raw[field] === 'string') clean[field] = raw[field].slice(0, 160);
  });
  if (getLocationById(raw.locationId)) clean.locationId = raw.locationId;
  return clean;
}
