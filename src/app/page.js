"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <header className="bg-white shadow">
        <nav className="container mx-auto flex justify-between items-center py-4 px-6">
          {/* Logo / Brand */}
          <Link href="/" className="text-xl font-bold text-blue-600">
            OVZP
          </Link>

          {/* Menu */}
          <ul className="flex gap-6">
            <li>
              <Link
                href="/components"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                PC komponenty
              </Link>
            </li>
            <li>
              <Link
                href="/login"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Login
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      {/* Hero section */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">OVZP</h1>
        <p className="text-gray-600 mb-8">
          požiadavky na počítače — all in one place.
        </p>

        <Link
          href="/login"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Get Started
        </Link>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow p-4 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} MyApp. All rights reserved.
      </footer>
    </div>
  );
}
