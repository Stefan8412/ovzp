"use client";

import { useState, useEffect } from "react";
import { account, setJWT } from "@/lib/appwrite";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const authUser = await account.get();
        // 🔑 Already logged in → get fresh JWT
        const jwtRes = await account.createJWT();
        setJWT(jwtRes.jwt);
        window.location.href = "/dashboard";
      } catch {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      // Clear stale sessions
      // await account.deleteSessions();

      // Login with email + password
      await account.createEmailPasswordSession(email, password);

      // 🔑 Immediately fetch JWT
      const jwtRes = await account.createJWT();
      setJWT(jwtRes.jwt);

      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || "Login failed");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">OVZP</h1>
        {error && (
          <p className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </p>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border rounded px-3 py-2"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
