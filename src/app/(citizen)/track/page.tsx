'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TrackSearchPage() {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState('');
  const [error, setError] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = trackingId.trim().toUpperCase();
    if (!cleaned) {
      setError('Please enter a valid Grievance Tracking ID');
      return;
    }
    router.push(`/track/${cleaned}`);
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-3xl shadow-sm">
          🔍
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Track Grievance Status
        </h1>
        <p className="text-sm text-slate-600">
          Enter your 10-character reference tracking code (e.g.,{' '}
          <code className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
            GRV-A1B2C3
          </code>
          ) to view real-time department updates, AI verification scores, and nodal officer remarks.
        </p>

        <form onSubmit={handleSearch} className="card mt-6 space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tracking Reference Code
            </label>
            <div className="relative">
              <input
                type="text"
                value={trackingId}
                onChange={(e) => {
                  setTrackingId(e.target.value);
                  setError('');
                }}
                placeholder="GRV-XXXXXX"
                className="w-full pl-4 pr-12 py-3 border border-slate-300 rounded-xl text-base font-mono uppercase tracking-wider focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm transition-colors"
              >
                Search
              </button>
            </div>
            {error && <p className="text-xs text-red-600 mt-1.5 font-medium">{error}</p>}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              💡 <strong>Tip for demo:</strong> You can try pre-seeded IDs such as{' '}
              <button
                type="button"
                onClick={() => setTrackingId('GRV-A1B2C3')}
                className="font-mono text-blue-700 underline hover:text-blue-900"
              >
                GRV-A1B2C3
              </button>{' '}
              or check{' '}
              <a href="/my-complaints" className="text-blue-700 underline">
                My Grievances
              </a>
              .
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
