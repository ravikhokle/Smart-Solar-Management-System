import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.data?.token) {
      localStorage.setItem('heliosflow_token', response.data.data.token);
      localStorage.setItem('heliosflow_user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.data?.token) {
      localStorage.setItem('heliosflow_token', response.data.data.token);
      localStorage.setItem('heliosflow_user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('heliosflow_token');
    localStorage.removeItem('heliosflow_user');
  },
};

export default authService;
