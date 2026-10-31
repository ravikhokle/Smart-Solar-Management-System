import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'ui',
  initialState: { toasts: [], sidebarOpen: false },
  reducers: {
    pushToast(state, action) {
      state.toasts.push({ id: Date.now() + Math.random(), ...action.payload });
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
