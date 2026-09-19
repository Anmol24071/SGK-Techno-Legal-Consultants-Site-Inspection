"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { SessionProvider, useSession as useNextAuthSession, signOut as nextAuthSignOut } from "next-auth/react";

export interface CustomUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE";
  status: "APPROVED" | "PENDING" | "DENIED" | "REVOKED";
  image?: string;
}

interface AuthContextType {
  session: { user: CustomUser } | null;
  status: "authenticated" | "unauthenticated" | "loading";
  loginAs: (user: CustomUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  status: "unauthenticated",
  loginAs: () => {},
  logout: () => {},
});

function InnerSessionProvider({ children }: { children: React.ReactNode }) {
  const { data: nextAuthSession, status: nextAuthStatus } = useNextAuthSession();
  const [localUser, setLocalUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sgk_user_session");
      if (saved) {
        setLocalUser(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Session parse error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (nextAuthStatus === "authenticated" && nextAuthSession?.user) {
      try {
        const u = nextAuthSession.user as CustomUser;
        localStorage.setItem("sgk_user_session", JSON.stringify(u));
        setLocalUser(u);
      } catch (e) {}
    } else if (nextAuthStatus === "unauthenticated") {
      try {
        localStorage.removeItem("sgk_user_session");
      } catch (e) {}
      setLocalUser(null);
    }
  }, [nextAuthStatus, nextAuthSession]);

  const loginAs = (user: CustomUser) => {
    localStorage.setItem("sgk_user_session", JSON.stringify(user));
    setLocalUser(user);
  };

  const logout = () => {
    localStorage.removeItem("sgk_user_session");
    setLocalUser(null);
    if (nextAuthSession) {
      try {
        nextAuthSignOut({ callbackUrl: "/" });
      } catch (e) {}
    }
  };

  // NextAuth is authoritative for session state
  let session: { user: CustomUser } | null = null;
  let status: "authenticated" | "unauthenticated" | "loading" = "loading";

  if (nextAuthStatus === "loading") {
    status = "loading";
    session = null;
  } else if (nextAuthStatus === "authenticated" && nextAuthSession?.user) {
    status = "authenticated";
    session = nextAuthSession as any;
  } else {
    // nextAuthStatus === "unauthenticated"
    status = "unauthenticated";
    session = null;
  }

  return (
    <AuthContext.Provider value={{ session, status, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <InnerSessionProvider>{children}</InnerSessionProvider>
    </SessionProvider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
