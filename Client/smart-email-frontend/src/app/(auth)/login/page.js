"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // 🔴 Handle API error
    if (res?.error) {
      setError(res.error);
      setLoading(false);
      return;
    }

    // 🟢 Success
    login(res.access_token, res.user);
    router.push("/dashboard");
    setLoading(false);
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center text-white bg-cover bg-center"
      style={{ backgroundImage: "url('/auth-bg.png')" }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <form
        onSubmit={handleLogin}
        className="relative z-10 glass backdrop-blur-xl border border-white/10 p-10 rounded-2xl w-[380px] space-y-5 shadow-2xl"
      >
        <h1 className="text-2xl font-bold text-center">Welcome Back</h1>

        <input
          aria-label="Email"
          type="email"
          placeholder="Email"
          value={email}
          disabled={loading}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
          required
        />

        <input
          aria-label="Password"
          type="password"
          placeholder="Password"
          value={password}
          disabled={loading}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
          required
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition p-3 rounded-lg font-semibold"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-center text-zinc-400">
          No account?{" "}
          <span
            className="cursor-pointer underline"
            onClick={() => router.push("/signup")}
          >
            Sign up
          </span>
        </p>
      </form>
    </div>
  );
}