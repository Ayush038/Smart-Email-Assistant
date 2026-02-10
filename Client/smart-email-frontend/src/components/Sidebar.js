"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Inbox, Send, Plus, X } from "lucide-react";

export default function Sidebar({ open, onClose, onCompose }) {
  const pathname = usePathname();

  const items = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/inbox", label: "Inbox", icon: Inbox },
    { href: "/sent", label: "Sent", icon: Send },
  ];

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}
      <aside
        className={`
          fixed lg:static top-0 left-0 h-full
          w-64 glass border-r border-white/10 p-6 flex flex-col
          transform transition-transform duration-300 z-50
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Mobile close button */}
        <div className="flex justify-between items-center mb-4 lg:hidden">
          <h2 className="text-white font-semibold">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Compose */}
        <button
          onClick={() => {
            onCompose?.();
            onClose?.();
          }}
          className="mb-4 flex items-center gap-2 px-3 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          Compose
        </button>

        <nav className="flex flex-col gap-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-zinc-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}