import { create } from 'zustand';
import { supabase } from '../utils/supabase.js';

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  loading: true,
  authError: null,

  init: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ user: session?.user ?? null, session, loading: false });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null, session });
    });
  },

  signUp: async (email, password, fullName) => {
    set({ authError: null, loading: true });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    if (error) set({ authError: error.message, loading: false });
    else set({ user: data.user, session: data.session, loading: false });
    return { data, error };
  },

  signIn: async (email, password) => {
    set({ authError: null, loading: true });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) set({ authError: error.message, loading: false });
    else set({ user: data.user, session: data.session, loading: false });
    return { data, error };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  clearError: () => set({ authError: null }),
}));
