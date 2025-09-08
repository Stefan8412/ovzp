"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold text-gray-800 dark:text-gray-100"
          >
            <div className="flex items-center gap-3">
              <img
                src="https://fra.cloud.appwrite.io/v1/storage/buckets/68b958a3001c91b06757/files/68be7b7f0021269a391a/view?project=68a568df00155ab4407d&mode=admin" // place your logo in the public/ folder
                alt="Logo"
                className="h-20 w-20 object-contain"
              />
            </div>
          </Link>

          {/* Desktop menu */}
          <nav className="hidden md:flex space-x-6">
            <Link
              href="/"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              Home
            </Link>
            <Link
              href="/components"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              PC komponenty
            </Link>
            <Link
              href="/login"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              Login
            </Link>
          </nav>

          {/* Hamburger button (mobile only) */}
          <button
            className="md:hidden text-gray-800 dark:text-gray-100 focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-700">
          <nav className="flex flex-col px-4 py-2 space-y-2">
            <Link
              href="/"
              className="hover:text-blue-600 dark:hover:text-blue-400"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/components"
              className="hover:text-blue-600 dark:hover:text-blue-400"
              onClick={() => setIsOpen(false)}
            >
              PC komponenty
            </Link>
            <Link
              href="/login"
              className="hover:text-blue-600 dark:hover:text-blue-400"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
