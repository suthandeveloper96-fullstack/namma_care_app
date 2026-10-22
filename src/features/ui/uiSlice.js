import { createSlice, nanoid } from '@reduxjs/toolkit';

const MAX_TOASTS = 4;

const uiSlice = createSlice({
  name: 'ui',
  initialState: { toasts: [] },
  reducers: {
    toastShown: {
      reducer(state, { payload }) {
        state.toasts.push(payload);
        if (state.toasts.length > MAX_TOASTS) state.toasts.shift();
      },
      prepare({ title, message = '', tone = 'success' }) {
        return { payload: { id: nanoid(), title, message, tone } };
      },
    },
    toastDismissed(state, { payload: id }) {
      state.toasts = state.toasts.filter((t) => t.id !== id);
    },
  },
});

export const { toastShown, toastDismissed } = uiSlice.actions;
export default uiSlice.reducer;
export const selectToasts = (state) => state.ui.toasts;
