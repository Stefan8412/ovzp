"use client";

import { useState, useEffect } from "react";
import { account, setJWT } from "@/lib/appwrite";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // 🔹 Handle dark mode persistence
  useEffect(() => {
    if (localStorage.getItem("theme") === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  }, []);

  function toggleDarkMode() {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  }

  // 🔹 Check if already logged in
  useEffect(() => {
    async function checkSession() {
      try {
        const authUser = await account.get();
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
      await account.createEmailPasswordSession(email, password);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          OVZP
        </h1>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <nav className="flex gap-6">
            <a
              href="/"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              Home
            </a>
          </nav>
        </div>
        <button
          onClick={toggleDarkMode}
          className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </header>

      {/* Login Form */}
      <main className="flex-grow flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
            Login
          </h2>
          {error && (
            <p className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 px-4 py-2 rounded mb-4">
              {error}
            </p>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full border rounded px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-300"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full border rounded px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-300"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
            >
              Login
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
