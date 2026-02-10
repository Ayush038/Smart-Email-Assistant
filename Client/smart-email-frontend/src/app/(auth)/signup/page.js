"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    const res = await apiFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        username,
        full_name: fullName,
      }),
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
        onSubmit={handleSignup}
        className="relative z-10 glass backdrop-blur-xl border border-white/10 p-10 rounded-2xl w-[380px] space-y-5 shadow-2xl"
      >
        <h1 className="text-2xl font-bold text-center">Create Account</h1>

        <input
          aria-label="Full Name"
          type="text"
          placeholder="Full Name"
          value={fullName}
          disabled={loading}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-3 bg-white/10 rounded-lg focus:ring-2 focus:ring-green-500 transition disabled:opacity-50"
          required
        />

        <input
          aria-label="Username"
          type="text"
          placeholder="Username"
          value={username}
          disabled={loading}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 bg-white/10 rounded-lg focus:ring-2 focus:ring-green-500 transition disabled:opacity-50"
          required
        />

        <input
          aria-label="Email"
          type="email"
          placeholder="Email"
          value={email}
          disabled={loading}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 bg-white/10 rounded-lg focus:ring-2 focus:ring-green-500 transition disabled:opacity-50"
          required
        />

        <input
          aria-label="Password"
          type="password"
          placeholder="Password"
          value={password}
          disabled={loading}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 bg-white/10 rounded-lg focus:ring-2 focus:ring-green-500 transition disabled:opacity-50"
          required
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 transition p-3 rounded-lg font-semibold"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p className="text-sm text-center text-zinc-400">
          Already have an account?{" "}
          <span
            className="cursor-pointer underline"
            onClick={() => router.push("/login")}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}