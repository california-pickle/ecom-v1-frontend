"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
// ✅ Axios instance er path ta check koro, jodi "@" kaj na kore tahole "../../lib/axiosInstance" dao
import axiosInstance from "@/lib/axiosInstance";

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
const AUTH_KEY = "admin_authenticated";

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  // ✅ useState ekhon thikmoto define kora
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(AUTH_KEY);
    if (stored === "true") setIsAuthenticated(true);
  }, []);

  const logout = async () => {
    try {
      // ✅ Backend call jate cookies clear hoy
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      // ✅ Local state clean kora
      setIsAuthenticated(false);
      sessionStorage.removeItem(AUTH_KEY);
      // Login page e reload kore pathiye dewa
      window.location.href = "/admin/login";
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
