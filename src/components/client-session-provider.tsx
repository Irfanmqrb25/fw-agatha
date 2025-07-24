"use client";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { AuthProvider } from "@/contexts/auth-context";

export function ClientSessionProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider
      refetchInterval={300}
      refetchOnWindowFocus={true}
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </SessionProvider>
  );
} 