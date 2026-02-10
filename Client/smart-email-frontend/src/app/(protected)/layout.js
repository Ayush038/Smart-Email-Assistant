"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import ComposeModal from "@/components/ComposeModal";

export default function ProtectedLayout({ children }) {
  const { token, loading } = useAuth();
  const router = useRouter();

  const [composeOpen, setComposeOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !token) {
      router.push("/login");
    }
  }, [token, loading, router]);

  if (loading || !token) return null;

  return (
    <div
      className="relative flex flex-col h-screen w-full bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative flex flex-col h-full">

        {/* Navbar */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Main layout */}
        <div className="flex flex-1 overflow-hidden">

          {/* Sidebar */}
          <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onCompose={() => setComposeOpen(true)}
          />

          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 text-white">
            {children}
          </main>

        </div>
      </div>

      {/* Compose modal */}
      <ComposeModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
      />
    </div>
  );
}