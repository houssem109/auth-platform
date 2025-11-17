"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  email: string | null;
  setEmail: (email: string | null) => void;
};

const AuthContext = createContext<AuthContextType>({
  email: null,
  setEmail: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [email, setEmailState] = useState<string | null>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined"
      ? localStorage.getItem("auth_email")
      : null;
    if (stored) {
      setEmailState(stored);
    }
  }, []);

  const setEmail = (value: string | null) => {
    setEmailState(value);
    if (typeof window !== "undefined") {
      if (value) localStorage.setItem("auth_email", value);
      else localStorage.removeItem("auth_email");
    }
  };

  return (
    <AuthContext.Provider value={{ email, setEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
