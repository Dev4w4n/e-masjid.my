import React from "react";
import { Link } from "react-router-dom";
import { Github, Facebook, Mail, MessageCircle } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link
              to="/"
              className="text-2xl font-bold tracking-tighter mb-4 inline-block"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
                Open E Masjid
              </span>
            </Link>
            <p className="text-gray-400 text-sm max-w-md mb-4">
              Inisiatif Perisian Sumber Terbuka untuk Transformasi Pengurusan
              Masjid. Kebebasan, Inovasi dan Kawalan Penuh.
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com/Dev4w4n/e-masjid.my"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Github size={20} />
              </a>
              <a
                href="https://facebook.com/izandotnet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://discord.gg/k2zGpWTDpe"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <MessageCircle size={20} />
              </a>
              <a
                href="mailto:support@e-masjid.my"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Modules */}
          <div>
            <h6 className="text-white font-semibold mb-4">Modul</h6>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/admin/display-management"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Paparan TV Masjid
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Chatbot AI Masjid
                </Link>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h6 className="text-white font-semibold mb-4">Pautan</h6>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/auth/signup"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Daftar Sekarang
                </Link>
              </li>
              <li>
                <Link
                  to="/auth/signin"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Log Masuk
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/Dev4w4n/e-masjid.my/graphs/contributors"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Penyumbang
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/k2zGpWTDpe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Discord Komuniti
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/sponsors/Dev4w4n"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Jadi Penaja
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Dev4w4n/e-masjid.my"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            Open E Masjid © {new Date().getFullYear()}{" "}
            <a
              href="https://4w4n.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Open Cloud Services (SA0604301-H)
            </a>
          </p>
          <p className="text-sm text-gray-500">
            Sumber Terbuka dengan ❤️ untuk komuniti masjid
          </p>
        </div>
      </div>
    </footer>
  );
};
