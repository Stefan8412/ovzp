"use client";

import Link from "next/link";
import Header from "./components/Header";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const SECRET_PASSWORD = "ovzp2025*"; // replace with your password

  function handleSubmit(e) {
    e.preventDefault();
    if (password === SECRET_PASSWORD) {
      setError("");
      setShowModal(false);
      setPassword("");
      router.push("/components");
    } else {
      setError("❌ Incorrect password");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Header */}
      <Header />

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        <section className="text-center">
          <h2 className="text-3xl font-bold mb-4">
            Vitajte na rezervačnom systéme OVZP - PSK
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Rezervujte si PC komponenty jednoducho a rýchlo cez náš systém.
          </p>
        </section>

        {/* Feature cards */}
        <section className="grid md:grid-cols-2 gap-6">
          {/* 🔹 Protected Components Card */}
          <div
            onClick={() => setShowModal(true)}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg cursor-pointer"
          >
            <h3 className="text-xl font-semibold mb-2">💻 PC komponenty</h3>
            <p className="text-gray-600 dark:text-gray-300">
              prezrite si našu ponuku PC komponentov a rezervujte si ich online.
            </p>
          </div>

          {/* 🔹 Normal card */}
          <Link href="/login">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg cursor-pointer">
              <h3 className="text-xl font-semibold mb-2">
                🔐 Pristupový managment - v príprave
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                organizujte a spravujte prístupy k vašim systémom jednoducho
              </p>
            </div>
          </Link>
        </section>
      </main>

      {/* Password Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Enter Password</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:text-gray-100"
              />
              {error && <p className="text-red-600">{error}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setPassword("");
                    setError("");
                  }}
                  className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 p-4 text-center mt-10 text-sm text-gray-600 dark:text-gray-400">
        © {new Date().getFullYear()} OVZP-PSK. All rights reserved.
      </footer>
    </div>
  );
}
