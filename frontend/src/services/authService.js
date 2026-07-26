import api from './api';
import { useAuthStore } from '../store/authStore';

export const authService = {
  // ── Register ────────────────────────────────────────────────────
  // Only creates the account — does NOT store tokens or update auth state.
  // Returns { success: true, message: 'Registration successful. Please log in.' }
  // The caller must redirect the user to /login after this resolves.
  async register(name, email, password) {
    const { data } = await api.post('/auth/register', { name, email, password });
    return data;
  },

  // ── Login ───────────────────────────────────────────────────────
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    useAuthStore.getState().setAuth(data.data.user, data.data.accessToken);
    return data.data;
  },

  // ── Logout ──────────────────────────────────────────────────────
  async logout() {
    try { await api.post('/auth/logout'); } catch {}
    useAuthStore.getState().clearAuth();
  },

  // ── Refresh ─────────────────────────────────────────────────────
  async refresh() {
    const { data } = await api.post('/auth/refresh');
    useAuthStore.getState().setToken(data.data.accessToken);
    return data.data.accessToken;
  },

  // ── Me ──────────────────────────────────────────────────────────
  async me() {
    const { data } = await api.get('/auth/me');
    return data.data.user;
  }
};
