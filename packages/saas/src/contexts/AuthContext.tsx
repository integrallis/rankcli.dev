import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { trackSignup } from '@/lib/conversions';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: (next?: string) => Promise<void>;
  loginWithGitHub: (next?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        isLoading: false,
        isAuthenticated: !!session,
      });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        isLoading: false,
        isAuthenticated: !!session,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      toast.error(error.message);
      throw error;
    }
    toast.success('Welcome back!');
  };

  const signup = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?type=email_confirm`,
      },
    });
    if (error) {
      toast.error(error.message);
      throw error;
    }

    if (!data.user) {
      toast.error('Unexpected error during sign up.');
      throw new Error('Signup failed: No user returned');
    }

    // Reddit optimises ad delivery against this event, which is the difference between paying
    // for clicks and paying for accounts. No-op on any build with no pixel configured.
    trackSignup();

    // Check if email confirmation is required
    // If identities array is empty, email confirmation is pending
    const needsEmailConfirmation = !data.session && data.user.identities?.length === 0;

    if (needsEmailConfirmation || !data.session) {
      toast.success('Check your email to confirm your account!', {
        description: 'We sent a verification link to ' + email,
        duration: 8000,
      });
    } else {
      toast.success('Account created successfully!');
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      throw error;
    }
    toast.success('Logged out successfully');
  };

  const loginWithGoogle = async (next?: string) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ''}`,
      },
    });
    if (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const loginWithGitHub = async (next?: string) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ''}`,
      },
    });
    if (error) {
      toast.error(error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        signup,
        logout,
        loginWithGoogle,
        loginWithGitHub,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
