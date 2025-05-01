import React, { createContext, useContext, useEffect, useState } from "react";

const BASE_URL = "http://localhost:3123/auth/check-auth";
type AuthContextType = {
  isAuthenticated: boolean;
  role: string | null;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [role, setRole] = useState<string | null>(null);

  const login = () => {
    setIsAuthenticated(true);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(BASE_URL, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setRole(data.role);
        }
      } catch {
        setIsAuthenticated(false);
        setRole(null);
      }
    };
    checkAuth();
  }, [login]);


  const logout = async () => {
    try {
      await fetch("http://localhost:3123/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setIsAuthenticated(false);
      setRole(null);
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, login, logout }}>
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
