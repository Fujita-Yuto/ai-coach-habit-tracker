"use client";

import { createContext, useContext, useEffect, useState, startTransition } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";

type AuthCtx = { user: User | null; loading: boolean };

const AuthContext = createContext<AuthCtx>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = getSupabase();

    // Supabase が設定されていない場合はゲストモード
    if (!sb) {
      startTransition(() => setLoading(false));
      return;
    }

    sb.auth.getUser().then(({ data }) => {
      startTransition(() => {
        setUser(data.user);
        setLoading(false);
      });
    });

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthCtx {
  return useContext(AuthContext);
}
