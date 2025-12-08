"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hubUrl = process.env.NEXT_PUBLIC_HUB_URL || "http://localhost:3000";

  return (
    <header className="header-islamic sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Branding */}
          <Link
            href="/"
            className="header-logo flex items-center gap-2 sm:gap-3 group"
          >
            <div className="logo-container">
              <Image
                src="/emasjid-500x500.png"
                alt="E-Masjid.My Logo"
                width={40}
                height={40}
                className="rounded-lg transition-transform duration-200 group-hover:scale-105"
                priority
                unoptimized
              />
            </div>
            <span className="text-lg sm:text-xl font-bold logo-text whitespace-nowrap">
              E-Masjid.My
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="header-nav-link">
              Laman Utama
            </Link>
            <Link href={`${hubUrl}/register`} className="btn-secondary">
              Tambah Iklan
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 flex-shrink-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-white/20">
            <div className="flex flex-col space-y-3 px-2">
              <Link
                href="/"
                className="header-nav-link text-center block"
                onClick={() => setMobileMenuOpen(false)}
              >
                Laman Utama
              </Link>
              <Link
                href={`${hubUrl}/register`}
                className="btn-secondary text-center block py-2.5 px-6"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tambah Iklan
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
