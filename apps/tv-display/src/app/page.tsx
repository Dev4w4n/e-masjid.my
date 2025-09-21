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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">E-Masjid TV Display</h1>
          <p className="text-gray-600">Digital signage system for Malaysian mosques</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="displayId" className="block text-sm font-medium text-gray-700 mb-2">
              Display ID
            </label>
            <input
              type="text"
              id="displayId"
              value={displayId}
              onChange={(e) => setDisplayId(e.target.value)}
              placeholder="Enter display ID (e.g., display-001)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter the unique ID for your TV display
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
          >
            Launch TV Display
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-900 mb-2">System Features</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>✓ Content Carousel</div>
              <div>✓ Prayer Times</div>
              <div>✓ Sponsorship Display</div>
              <div>✓ Offline Support</div>
              <div>✓ Real-time Monitoring</div>
              <div>✓ Touch Navigation</div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          <p>Version 1.0 | Built for Malaysian mosques</p>
        </div>
      </div>
    </div>
  );
}