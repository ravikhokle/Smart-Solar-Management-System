import axios from 'axios';
import { store } from '../store/index.js';
import { logout, setCredentials } from '../features/auth/authSlice.js';
import { pushToast } from '../features/ui/uiSlice.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const message = err.response?.data?.message || err.message || 'Request failed';
    if (status === 401) {
      store.dispatch(logout());
    }
    if (!err.config?.skipToast) {
      store.dispatch(pushToast({ type: 'error', message }));
    }
    return Promise.reject(err);
  }
);

export function toast(type, message) {
  store.dispatch(pushToast({ type, message }));
}

export async function downloadFile(path, filename) {
  const res = await api.get(path, { responseType: 'blob' });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export { setCredentials };
export default api;
