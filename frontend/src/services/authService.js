import api from './api';
import { useAuthStore } from '../store/authStore';

export const authService = {
  async register(name, email, password) {
    // Only creates the account — does NOT store tokens or update auth state.
    // The caller is responsible for redirecting to /login.
    const { data } = await api.post('/auth/register', { name, email, password });
    return data; // { success: true, message: "Registration successful. Please log in." }
  },

  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    useAuthStore.getState().setAuth(data.data.user, data.data.accessToken);
    return data.data;
  },

  async logout() {
    try { await api.post('/auth/logout'); } catch {}
    useAuthStore.getState().clearAuth();
  },

  async refresh() {
    const { data } = await api.post('/auth/refresh');
    useAuthStore.getState().setToken(data.data.accessToken);
    return data.data.accessToken;
  },

  async me() {
    const { data } = await api.get('/auth/me');
    return data.data.user;
  }
};
