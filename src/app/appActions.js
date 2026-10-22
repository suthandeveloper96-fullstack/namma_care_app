import { createAction } from '@reduxjs/toolkit';

/** Restores every slice to freshly generated demo data. */
export const resetDemoData = createAction('app/resetDemoData');

/** Replaces one slice with data written by another browser tab. */
export const hydrateSlice = createAction('app/hydrateSlice', (key, data) => ({ payload: { key, data } }));
