# ACLC P0 Frontend Infrastructure Creator

$BASE = "d:\CodeNeticz-KHacks-3.0\frontend\src"

function MkDir-Force($path) {
    if (-not (Test-Path $path)) { New-Item -ItemType Directory -Path $path -Force | Out-Null }
}

MkDir-Force "$BASE\store"
MkDir-Force "$BASE\components\layout"
MkDir-Force "$BASE\services"
MkDir-Force "$BASE\constants"

Write-Host "[1/6] Creating store/authStore.js"
@'
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Auth store — persists across page refreshes.
 * accessToken is kept in memory (not localStorage) for security.
 * user info is persisted to localStorage for UX (non-sensitive).
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:        null,   // { id, name, email, role }
      accessToken: null,   // In-memory only (cleared on refresh)
      isLoading:   false,

      setAuth: (user, accessToken) => set({ user, accessToken }),
      setToken: (accessToken)      => set({ accessToken }),
      clearAuth: ()                => set({ user: null, accessToken: null }),
      setLoading: (v)              => set({ isLoading: v }),

      isAuthenticated: () => !!get().user,
      isTeacher: ()        => get().user?.role === 'TEACHER',
      isStudent: ()        => get().user?.role === 'STUDENT',
      isAdmin: ()          => get().user?.role === 'ADMIN'
    }),
    {
      name: 'aclc_auth',
      // Only persist non-sensitive user info — never persist the token
      partialize: (state) => ({ user: state.user })
    }
  )
);
'@ | Set-Content -Encoding UTF8 "$BASE\store\authStore.js"

Write-Host "[2/6] Creating store/accessibilityStore.js"
@'
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULTS = {
  mode:        'standard',  // standard | reading-support | number-support | voice-input | focus
  fontFamily:  'inter',
  fontSize:    1.0,
  lineSpacing: 'normal',
  wordSpacing: 'normal',
  colorTheme:  'standard',
  readingGuide: false,
  ttsEnabled:   false,
  sttPreferred: false,
  highContrast: false
};

export const useAccessibilityStore = create(
  persist(
    (set, get) => ({
      ...DEFAULTS,

      setMode: (mode) => {
        set({ mode });
        applyTheme(mode);
      },
      updatePreference: (key, value) => set({ [key]: value }),
      reset: () => { set(DEFAULTS); applyTheme('standard'); },

      getCurrentMode: () => get().mode
    }),
    { name: 'aclc_a11y' }
  )
);

function applyTheme(mode) {
  const themeMap = {
    'standard':       '',
    'reading-support': 'reading-support',
    'number-support':  'dark',
    'voice-input':     'dark',
    'focus':           'focus'
  };
  document.documentElement.setAttribute('data-theme', themeMap[mode] || '');
}
'@ | Set-Content -Encoding UTF8 "$BASE\store\accessibilityStore.js"

Write-Host "[3/6] Creating store/gamificationStore.js"
@'
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useGamificationStore = create(
  persist(
    (set, get) => ({
      xp:             0,
      level:          1,
      world:          1,
      streak:         0,
      gems:           0,
      completedLevels: [],
      lastActiveDate: null,

      syncFromServer: (data) => set({
        xp:    data.xp    ?? get().xp,
        level: data.level ?? get().level,
        world: data.world ?? get().world,
        streak: data.streak ?? get().streak,
        gems:   data.gems ?? get().gems
      }),

      addXP: (amount) => set(s => {
        const newXP    = s.xp + amount;
        const newLevel = Math.floor(newXP / 1000) + 1;
        const newWorld = Math.min(10, Math.floor((newLevel - 1) / 10) + 1);
        return { xp: newXP, level: newLevel, world: newWorld };
      }),

      completeLevel: (levelId) => set(s => ({
        completedLevels: s.completedLevels.includes(levelId)
          ? s.completedLevels
          : [...s.completedLevels, levelId]
      })),

      xpToNextLevel: () => 1000 - (get().xp % 1000),
      levelProgress:  () => (get().xp % 1000) / 10  // 0-100 percentage
    }),
    { name: 'aclc_gamification' }
  )
);
'@ | Set-Content -Encoding UTF8 "$BASE\store\gamificationStore.js"

Write-Host "[4/6] Creating components/layout/ProtectedRoute.jsx"
@'
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

/**
 * Guards a route based on authentication and optional role requirement.
 * Unauthenticated users are redirected to /login with the intended path saved.
 * Wrong-role users are redirected to their correct dashboard.
 *
 * Usage:
 *   <Route path="/student/dashboard" element={<ProtectedRoute role="STUDENT"><Dashboard /></ProtectedRoute>} />
 *   <Route path="/staff/dashboard"   element={<ProtectedRoute role="TEACHER"><StaffDashboard /></ProtectedRoute>} />
 */
const ProtectedRoute = ({ children, role }) => {
  const user        = useAuthStore(s => s.user);
  const location    = useLocation();

  // Not authenticated at all
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Wrong role
  if (role && user.role !== role) {
    const redirect = user.role === 'TEACHER' || user.role === 'ADMIN'
      ? '/staff/dashboard'
      : '/student/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return children;
};

export default ProtectedRoute;
'@ | Set-Content -Encoding UTF8 "$BASE\components\layout\ProtectedRoute.jsx"

Write-Host "[5/6] Creating services/api.js (Axios base instance)"
@'
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Base Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,           // Send httpOnly refresh token cookie
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// ── Request interceptor: attach access token ──────────────────
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

// ── Response interceptor: auto-refresh on 401 ─────────────────
let isRefreshing = false;
let waitQueue    = [];

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (err.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          waitQueue.push({ resolve, reject });
        }).then(token => {
          original.headers['Authorization'] = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        const newToken = data.data.accessToken;
        useAuthStore.getState().setToken(newToken);
        waitQueue.forEach(({ resolve }) => resolve(newToken));
        waitQueue = [];
        original.headers['Authorization'] = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshErr) {
        waitQueue.forEach(({ reject }) => reject(refreshErr));
        waitQueue = [];
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default api;
'@ | Set-Content -Encoding UTF8 "$BASE\services\api.js"

Write-Host "[6/6] Creating services/authService.js"
@'
import api from './api';
import { useAuthStore } from '../store/authStore';

export const authService = {
  async register(name, email, password) {
    const { data } = await api.post('/auth/register', { name, email, password });
    useAuthStore.getState().setAuth(data.data.user, data.data.accessToken);
    return data.data;
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
'@ | Set-Content -Encoding UTF8 "$BASE\services\authService.js"

Write-Host ""
Write-Host "All frontend P0 files created successfully." -ForegroundColor Green
