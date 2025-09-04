"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">OVZP - PSK</h1>
          <nav className="flex gap-6">
            <a
              href="/login"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              Login
            </a>
            <a
              href="/components"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              PC komponenty
            </a>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto p-6 space-y-8">
        <section className="text-center">
          <h2 className="text-3xl font-bold mb-4">
            Vitajte na rezervačnom systéme OVZP - PSK
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Rezervujte si PC komponenty jednoducho a rýchlo cez náš systém.
          </p>
        </section>

        {/* Example feature cards */}
        <section className="grid md:grid-cols-2 gap-6">
          <Link href="/components">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">💻 PC komponenty</h3>
              <p className="text-gray-600 dark:text-gray-300">
                prezrite si našu ponuku PC komponentov a rezervujte si ich
                online.
              </p>
            </div>
          </Link>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">
              🔐 Pristupový managment - v príprave
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              organizujte a spravujte prístupy k vašim systémom jednoducho
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 p-4 text-center mt-10 text-sm text-gray-600 dark:text-gray-400">
        © {new Date().getFullYear()} Rezervacny system. All rights reserved.
      </footer>
    </div>
  );
}
