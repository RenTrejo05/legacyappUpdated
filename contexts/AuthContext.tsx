"use client";

import type { User } from "@/types";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  user: User | null;
  login: (
    username: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay usuario guardado en sessionStorage
    if (typeof window !== "undefined") {
      const savedUser = sessionStorage.getItem("currentUser");

      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser) as User;
          setUser({ ...parsed, role: parsed.role ?? "user" });
        } catch (e) {
          sessionStorage.removeItem("currentUser");
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (
    username: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          res.status === 503
            ? data?.error ??
              "Servicio no disponible. En local, crea .env.local con MONGODB_URI."
            : data?.error ?? "Credenciales inválidas";
        return { success: false, error: message };
      }

      const loggedUser: User = {
        ...data,
        role: data.role ?? "user",
      };

      setUser(loggedUser);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("currentUser", JSON.stringify(loggedUser));
      }

      return { success: true };
    } catch (e) {
      console.error("Error en login:", e);
      return {
        success: false,
        error: "Error de conexión. En local, revisa que .env.local tenga MONGODB_URI.",
      };
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("currentUser");
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
