"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="card-islamic p-8 max-w-md text-center">
        <span className="text-6xl mb-4 block">⚠️</span>
        <h2 className="text-2xl font-bold text-islamic-green-800 mb-4">
          Maaf, Terjadi Ralat
        </h2>
        <p className="text-gray-600 mb-6">
          Sistem mengalami masalah. Sila cuba lagi.
        </p>
        <button onClick={reset} className="btn-primary">
          Cuba Lagi
        </button>
      </div>
    </div>
  );
}
