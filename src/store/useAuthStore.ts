import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005';
const AUTH_STORAGE_KEY = 'dashboard-auth-state';

interface TokenResponse {
  access: string;
  refresh: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  username: string | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
  getAccessToken: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      username: null,
      isAuthenticated: false,

      login: async (identifier: string, password: string): Promise<boolean> => {
        try {
          const response = await fetch(`${API_BASE_URL}/token/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: identifier, password }),
          });

          if (!response.ok) {
            return false;
          }

          const data: TokenResponse = await response.json();
          set({
            accessToken: data.access,
            refreshToken: data.refresh,
            username: identifier,
            isAuthenticated: true,
          });
          return true;
        } catch {
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        set({
          accessToken: null,
          refreshToken: null,
          username: null,
          isAuthenticated: false,
        });
      },

      refreshAccessToken: async (): Promise<boolean> => {
        const { refreshToken } = get();
        if (!refreshToken) {
          return false;
        }

        try {
          const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
          });

          if (!response.ok) {
            // Refresh token expired, logout
            get().logout();
            return false;
          }

          const data: { access: string } = await response.json();
          set({ accessToken: data.access });
          return true;
        } catch {
          get().logout();
          return false;
        }
      },

      getAccessToken: () => {
        return get().accessToken;
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
    }
  )
);
