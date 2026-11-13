import type { User } from '@supabase/supabase-js';

export interface AuthFormValues {
  email: string;
  password: string;
  username?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string;
  signIn: (values: AuthFormValues) => Promise<void>;
  signUp: (values: AuthFormValues & { username: string }) => Promise<{
    requiresEmailConfirmation: boolean;
  }>;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState;
