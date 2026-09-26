import { create } from 'zustand';

const SESSION_KEY = 'careerpilot-session';

function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return { user: null, token: null, profile: null };
    return JSON.parse(raw);
  } catch {
    return { user: null, token: null, profile: null };
  }
}

export const useAuthStore = create((set, get) => {
  const initial = getStoredSession();

  return {
    user: initial.user,
    token: initial.token,
    profile: initial.profile,
    isAuthenticated: Boolean(initial.token),

    setAuth: ({ user, token, profile }) => {
      const state = {
        user,
        token,
        profile: profile || get().profile,
        isAuthenticated: Boolean(token)
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(state));
      set(state);
    },

    setProfile: (profile) => {
      const state = {
        ...get(),
        profile
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        user: state.user,
        token: state.token,
        profile: state.profile
      }));
      set({ profile });
    },

    logout: () => {
      localStorage.removeItem(SESSION_KEY);
      set({
        user: null,
        token: null,
        profile: null,
        isAuthenticated: false
      });
    }
  };
});
