import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, Settings, User as UserIcon } from "lucide-react";
import { useUser, useProfile, useAuthActions } from "@masjid-suite/auth";

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = useUser();
  const profile = useProfile();
  const { signOut } = useAuthActions();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navLinks = [
    { label: "Utama", path: "/" },
    { label: "Masjid", path: "/masjids" },
    { label: "Paparan", path: "/admin/display-management" },
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
        <Link to="/" className="text-2xl font-bold tracking-tighter">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
            Open E Masjid
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center text-white text-sm font-semibold">
                  {profile?.full_name?.charAt(0) ||
                    user.email?.charAt(0) ||
                    "U"}
                </div>
                <span className="hidden lg:inline">
                  {profile?.full_name || user.email}
                </span>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <UserIcon size={16} />
                    Profil
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <Settings size={16} />
                    Tetapan
                  </Link>
                  <hr className="my-2 border-gray-200" />
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Log Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/auth/signin"
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-full transition-colors text-sm"
            >
              Log Masuk
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg font-medium text-gray-700 hover:text-primary text-left"
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <>
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-medium text-gray-700 hover:text-primary text-left"
              >
                Profil
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="text-lg font-medium text-red-600 hover:text-red-700 text-left"
              >
                Log Keluar
              </button>
            </>
          ) : (
            <Link
              to="/auth/signin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-full transition-colors text-center"
            >
              Log Masuk
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};
