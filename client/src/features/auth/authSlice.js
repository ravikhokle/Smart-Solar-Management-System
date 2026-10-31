import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('hf_token');
const user = localStorage.getItem('hf_user');

const slice = createSlice({
  name: 'auth',
  initialState: {
    token: token || null,
    user: user ? JSON.parse(user) : null,
  },
  reducers: {
    setCredentials(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('hf_token', action.payload.token);
      localStorage.setItem('hf_user', JSON.stringify(action.payload.user));
    },
    setUser(state, action) {
      state.user = action.payload;
      localStorage.setItem('hf_user', JSON.stringify(action.payload));
    },
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem('hf_token');
      localStorage.removeItem('hf_user');
    },
  },
});

export const { setCredentials, setUser, logout } = slice.actions;
export default slice.reducer;
