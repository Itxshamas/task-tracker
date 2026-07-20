import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { supabase } from "../config/supabase";
import authService from "../services/auth/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
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

        // load profile for the current user if available
        try {
          const userId = currentSession?.user?.id;
          if (userId) {
            const { data: p } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", userId)
              .single();
            setProfile(p ?? null);
          } else {
            setProfile(null);
          }
        } catch (e) {
          setProfile(null);
        }

        // If Supabase reports no active session but there are leftover
        // auth tokens in storage, clear them to avoid attempting refresh
        // with a stale/invalid refresh token which results in 400 errors.
        if (!currentSession) {
          try {
            const hasStored = Object.keys(window.localStorage || {}).some((k) =>
              /supabase|sb-|supabase.auth/i.test(k),
            );
            if (hasStored) {
              // sign out will clear Supabase stored session and cookies
              await supabase.auth.signOut();

              // also clear any supabase-related localStorage keys as a safety net
              Object.keys(window.localStorage || {}).forEach((key) => {
                if (/supabase|sb-|supabase.auth/i.test(key)) {
                  try {
                    window.localStorage.removeItem(key);
                  } catch (e) {
                    // ignore
                  }
                }
              });
            }
          } catch (e) {
            // ignore localStorage errors
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      // If token refresh fails, clear stored session to avoid repeated
      // refresh attempts with a bad token.
      if (event === "TOKEN_REFRESH_FAILED") {
        try {
          supabase.auth.signOut();
        } catch (e) {
          // ignore
        }

        try {
          Object.keys(window.localStorage || {}).forEach((key) => {
            if (/supabase|sb-|supabase.auth/i.test(key)) {
              try {
                window.localStorage.removeItem(key);
              } catch (err) {
                // ignore
              }
            }
          });
        } catch (err) {
          // ignore
        }
      }

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      // fetch profile on session change
      (async () => {
        try {
          const userId = nextSession?.user?.id;
          if (userId) {
            const { data: p } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", userId)
              .single();
            setProfile(p ?? null);
          } else {
            setProfile(null);
          }
        } catch (e) {
          setProfile(null);
        }
      })();
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
    setProfile(null);
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
      profile,
      isAdmin: profile?.role === "admin",
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
