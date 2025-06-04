import React, { createContext, useContext, useEffect, useState } from "react";
import { logoutUser, checkAuthStatus } from "../services";

type AuthContextType = {
  isAuthenticated: boolean;
  role: string | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Define checkAuth within the context
  const checkAuth = async () => {
    setLoading(true);
    try {
      const data = await checkAuthStatus();
      setIsAuthenticated(true);
      setRole(data.role);
    } catch (error) {
      setIsAuthenticated(false);
      setRole(null);
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const authCheckPerformed = localStorage.getItem("authCheckPerformed");
    if (!authCheckPerformed) {
      checkAuth();
      localStorage.setItem("authCheckPerformed", "true");
    } else {
      setLoading(false);
    }

    return () => {
      localStorage.removeItem("authCheckPerformed");
    };
  }, []);

  const login = () => {
    checkAuth();
  };

  const logout = async () => {
    try {
      await logoutUser(); // Use service
      setIsAuthenticated(false);
      setRole(null);
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, role, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
