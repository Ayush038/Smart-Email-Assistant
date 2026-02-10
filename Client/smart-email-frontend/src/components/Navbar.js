"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu } from "lucide-react";
import Image from "next/image";

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="glass-soft border-b border-white/10 h-16 flex items-center justify-between px-3 sm:px-6 relative z-[9999]">

      {/* Left section */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition text-white"
        >
          <Menu size={22} />
        </button>

        <Image
          src="/logo.png"
          alt="SmartMail logo"
          width={36}
          height={36}
          className="rounded-md object-contain"
        />

        {/* Hide long title on very small screens */}
        <h2 className="hidden sm:block text-white font-semibold text-lg">
          SmartMail
        </h2>
      </div>

      {/* User dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 px-2 sm:px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-white max-w-[160px] sm:max-w-none"
        >
          <span className="font-medium truncate">
            {user?.full_name || "User"}
          </span>
          <ChevronDown size={16} />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-[90vw] max-w-64 glass border border-white/10 rounded-xl shadow-xl p-4 space-y-3 z-[10000]">

            <div className="space-y-1">
              <p className="text-xs text-zinc-400">Full Name</p>
              <p className="text-white font-medium break-words">
                {user?.full_name || "-"}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-zinc-400">Username</p>
              <p className="text-white font-medium break-words">
                @{user?.username || "-"}
              </p>
            </div>

            <div className="border-t border-white/10 pt-3">
              <button
                onClick={logout}
                className="w-full bg-red-600 hover:bg-red-700 rounded-lg py-2 text-sm text-white transition"
              >
                Logout
              </button>
            </div>

          </div>
        )}
      </div>

    </header>
  );
}