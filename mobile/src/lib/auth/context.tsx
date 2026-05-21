import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { apiRequest, getActiveCompanyId, setActiveCompanyId } from '../api';

export type Membership = {
  company_id: string;
  company_name: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
};

export type Me = {
  id: string;
  email: string;
  full_name: string | null;
  memberships: Membership[];
};

export type AuthContextValue = {
  initializing: boolean;
  session: Session | null;
  user: Me | null;
  activeCompanyId: string | null;
  memberships: Membership[];
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: { email: string; password: string; full_name: string; company_name: string }) => Promise<void>;
  signOut: () => Promise<void>;
  switchCompany: (companyId: string) => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchMe(): Promise<Me> {
  return apiRequest<Me>('/api/v1/auth/me');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initializing, setInitializing] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Me | null>(null);
  const [activeCompanyId, setActiveCompany] = useState<string | null>(null);

  const loadMe = useCallback(async (): Promise<void> => {
    try {
      const me = await fetchMe();
      setUser(me);
      const stored = await getActiveCompanyId();
      const valid = me.memberships.find((m) => m.company_id === stored);
      const next = valid?.company_id ?? me.memberships[0]?.company_id ?? null;
      if (next !== stored) {
        await setActiveCompanyId(next);
      }
      setActiveCompany(next);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      if (data.session) {
        await loadMe();
      }
      setInitializing(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) {
        await loadMe();
      } else {
        setUser(null);
        setActiveCompany(null);
        await setActiveCompanyId(null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [loadMe]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  }, []);

  const signUp = useCallback(
    async (input: { email: string; password: string; full_name: string; company_name: string }) => {
      const { error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            full_name: input.full_name,
            company_name: input.company_name,
          },
        },
      });
      if (error) throw new Error(error.message);
    },
    [],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    await setActiveCompanyId(null);
    setActiveCompany(null);
    setUser(null);
  }, []);

  const switchCompany = useCallback(async (companyId: string) => {
    await setActiveCompanyId(companyId);
    setActiveCompany(companyId);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      initializing,
      session,
      user,
      activeCompanyId,
      memberships: user?.memberships ?? [],
      signIn,
      signUp,
      signOut,
      switchCompany,
      refreshMe: loadMe,
    }),
    [initializing, session, user, activeCompanyId, signIn, signUp, signOut, switchCompany, loadMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
