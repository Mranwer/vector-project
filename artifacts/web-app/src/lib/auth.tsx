import React, { createContext, useContext, useEffect, useState } from "react";
import { useGetMe, User } from "@workspace/api-client-react";
import { useLocation } from "wouter";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string) => void;
  adminLogin: (token: string) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(localStorage.getItem("vtds_token"));
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem("vtds_admin_token"));

  // Apply token to global fetch
  useEffect(() => {
    const activeToken = adminToken || token;
    if (activeToken) {
      // In a real app we'd configure the Orval fetch instance here.
      // Assuming custom-fetch reads from localStorage.
      localStorage.setItem("vtds_active_token", activeToken);
    } else {
      localStorage.removeItem("vtds_active_token");
    }
  }, [token, adminToken]);

  const { data: user, isLoading, isError } = useGetMe({
    query: {
      enabled: !!(token || adminToken),
      retry: false,
    }
  });

  useEffect(() => {
    if (isError) {
      logout();
    }
  }, [isError]);

  const login = (newToken: string) => {
    localStorage.setItem("vtds_token", newToken);
    setToken(newToken);
  };

  const adminLogin = (newToken: string) => {
    localStorage.setItem("vtds_admin_token", newToken);
    setAdminToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("vtds_token");
    localStorage.removeItem("vtds_admin_token");
    localStorage.removeItem("vtds_active_token");
    setToken(null);
    setAdminToken(null);
    setLocation("/login");
  };

  return (
    <AuthContext.Provider value={{
      user: user || null,
      isLoading,
      login,
      adminLogin,
      logout,
      isAdmin: !!adminToken || user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) {
  const { user, isLoading, isAdmin } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setLocation(requireAdmin ? "/admin/login" : "/login");
      } else if (requireAdmin && !isAdmin) {
        setLocation("/dashboard");
      }
    }
  }, [user, isLoading, isAdmin, requireAdmin, setLocation]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || (requireAdmin && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
}
