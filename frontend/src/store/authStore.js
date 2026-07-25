import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Auth store â€” persists across page refreshes.
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
      // Only persist non-sensitive user info â€” never persist the token
      partialize: (state) => ({ user: state.user })
    }
  )
);
