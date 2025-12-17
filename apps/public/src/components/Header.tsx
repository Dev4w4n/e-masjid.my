"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const hubUrl = process.env.NEXT_PUBLIC_HUB_URL || "http://localhost:3000";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Laman Utama", path: "/" },
    { label: "Tentang Kami", path: "/about" },
    { label: "Hubungi", path: "/contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen
          ? "bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tighter">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
            Open E Masjid
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}

          <Link
            href={`${hubUrl}/register`}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-full transition-colors text-sm"
          >
            Tambah Iklan
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-lg p-6 flex flex-col gap-6 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg font-medium text-gray-700 hover:text-primary text-left"
            >
              {link.label}
            </Link>
          ))}

          <Link
            href={`${hubUrl}/register`}
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-full transition-colors text-center"
          >
            Tambah Iklan
          </Link>
        </div>
      )}
    </nav>
  );
}
