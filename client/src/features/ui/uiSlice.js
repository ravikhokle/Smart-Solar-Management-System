import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'ui',
  initialState: { toasts: [], sidebarOpen: false },
  reducers: {
    pushToast(state, action) {
      const now = Date.now();
      const last = state.toasts[state.toasts.length - 1];
      if (last && last.message === action.payload.message && now - (last.timestamp || 0) < 1500) {
        return;
      }
      state.toasts.push({
        id: now + Math.random(),
        timestamp: now,
        ...action.payload,
      });
      if (state.toasts.length > 5) {
        state.toasts.shift();
      }
    },
    removeToast(state, action) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    setSidebar(state, action) {
      state.sidebarOpen = action.payload;
    },
  },
});

export const { pushToast, removeToast, setSidebar } = slice.actions;
export default slice.reducer;
