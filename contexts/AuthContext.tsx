"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "@/types";
import { apiClient } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay token guardado en localStorage
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("authToken");
      const savedUser = localStorage.getItem("currentUser");
      
      if (savedToken && savedUser) {
        try {
          apiClient.setToken(savedToken);
          setUser(JSON.parse(savedUser));
        } catch (e) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("currentUser");
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await apiClient.login(username, password);
      setUser(response.user);
      
      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("currentUser", JSON.stringify(response.user));
      }
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    apiClient.setToken(null);
    
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("currentUser");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
