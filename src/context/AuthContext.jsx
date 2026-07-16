import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { supabase } from "../config/supabase";
import authService from "../services/auth/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      setLoading(true);

      try {
        const currentSession = await authService.getSession();

        if (!isMounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function register(nameOrValues, email, password) {
    const payload =
      typeof nameOrValues === "object" && nameOrValues !== null
        ? nameOrValues
        : { name: nameOrValues, email, password };

    const data = await authService.register(
      payload.name,
      payload.email,
      payload.password,
    );

    setSession(data.session);
    setUser(data.user ?? null);

    return data;
  }

  async function login(emailOrValues, password) {
    const payload =
      typeof emailOrValues === "object" && emailOrValues !== null
        ? emailOrValues
        : { email: emailOrValues, password };

    const data = await authService.login(payload.email, payload.password);

    setSession(data.session);
    setUser(data.user ?? null);

    return data;
  }

  async function logout() {
    await authService.logout();

    setUser(null);
    setSession(null);
  }

  async function forgotPassword(email) {
    return authService.forgotPassword(email);
  }

  async function updatePassword(password) {
    return authService.updatePassword(password);
  }

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      register,
      login,
      logout,
      forgotPassword,
      updatePassword,
      isAuthenticated: !!user,
    }),
    [loading, session, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
