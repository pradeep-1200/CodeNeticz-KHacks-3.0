import api from './api';
import { useAuthStore } from '../store/authStore';

export const authService = {
  async register(name, email, password) {
    // Only creates the account — does NOT store tokens or update auth state.
    // The caller is responsible for redirecting to /login.
    const { data } = await api.post('/auth/register', { name, email, password });
    // Guard: backend should return { success: true, message: "..." }
    // If the response is malformed (e.g. cold-start HTML error page), surface a clean message.
    if (!data || typeof data !== 'object') {
      throw new Error('Registration failed. Please try again.');
    }
    if (!data.success) {
      const msg = data?.error?.message || data?.message || 'Registration failed. Please try again.';
      throw new Error(msg);
    }
    return data; // { success: true, message: "Registration successful. Please log in." }
  },

  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    // Guard: response must be { success: true, data: { user, accessToken } }
    if (!data?.data?.user || !data?.data?.accessToken) {
      throw new Error('Login failed. Unexpected server response.');
    }
    useAuthStore.getState().setAuth(data.data.user, data.data.accessToken);
    return data.data;
  },

  async logout() {
    try { await api.post('/auth/logout'); } catch {}
    useAuthStore.getState().clearAuth();
  },

  async refresh() {
    const { data } = await api.post('/auth/refresh');
    if (!data?.data?.accessToken) {
      throw new Error('Session refresh failed.');
    }
    useAuthStore.getState().setToken(data.data.accessToken);
    return data.data.accessToken;
  },

  async me() {
    const { data } = await api.get('/auth/me');
    return data?.data?.user ?? null;
  }
};
