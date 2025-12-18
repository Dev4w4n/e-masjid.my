'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [displayId, setDisplayId] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (displayId.trim()) {
      router.push(`/display/${displayId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-islamic-green-50 flex items-center justify-center islamic-pattern">
      <div className="card-islamic p-8 max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-islamic-green-500 to-islamic-teal-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
             {/* Placeholder for logo if needed, or just an icon */}
             <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
             </svg>
          </div>
          <h1 className="text-3xl font-bold text-islamic-primary mb-2">Open E Masjid TV</h1>
          <p className="text-islamic-green-700">Sistem Paparan Digital Masjid</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="displayId" className="block text-sm font-medium text-islamic-green-800 mb-2">
              ID Paparan
            </label>
            <input
              type="text"
              id="displayId"
              value={displayId}
              onChange={(e) => setDisplayId(e.target.value)}
              placeholder="Masukkan ID paparan (cth: display-001)"
              className="w-full px-4 py-3 border border-islamic-green-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-islamic-green-500 focus:border-islamic-green-500 text-gray-900 bg-white"
              required
            />
            <p className="mt-1 text-sm text-islamic-green-600">
              Masukkan ID unik untuk paparan TV ini
            </p>
          </div>

          <button
            type="submit"
            className="w-full btn-islamic-gold text-white py-3 px-4 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            Lancarkan Paparan TV
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-islamic-green-100">
          <div className="text-center">
            <h3 className="text-sm font-bold text-islamic-green-800 mb-3">Ciri-ciri Sistem</h3>
            <div className="grid grid-cols-2 gap-3 text-xs text-islamic-green-700">
              <div className="flex items-center justify-center gap-1">
                <span className="text-islamic-gold-500">✓</span> Karusel Kandungan
              </div>
              <div className="flex items-center justify-center gap-1">
                <span className="text-islamic-gold-500">✓</span> Waktu Solat
              </div>
              <div className="flex items-center justify-center gap-1">
                <span className="text-islamic-gold-500">✓</span> Paparan Penaja
              </div>
              <div className="flex items-center justify-center gap-1">
                <span className="text-islamic-gold-500">✓</span> Sokongan Offline
              </div>
              <div className="flex items-center justify-center gap-1">
                <span className="text-islamic-gold-500">✓</span> Pemantauan Real-time
              </div>
              <div className="flex items-center justify-center gap-1">
                <span className="text-islamic-gold-500">✓</span> Navigasi Sentuh
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-islamic-green-600">
          <p>Versi 1.0 | Dibina untuk Masjid Malaysia</p>
        </div>
      </div>
    </div>
  );
}
