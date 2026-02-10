"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthLayout({ children }) {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && token) {
      router.push("/dashboard");
    }
  }, [token, loading, router]);

  if (loading) return null;

  return !token ? children : null;
}