'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useAppStore } from '@/store/app-store';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { sidebarOpen, toggleSidebar } = useAppStore();

  const navItems = [
    { name: 'Dashboard Overview', href: '/dashboard', icon: '📊' },
    { name: 'All Grievances', href: '/complaints', icon: '📋' },
    { name: 'Flagged / Tampered', href: '/complaints?isFlagged=true', icon: '⚠️' },
    { name: 'Public Portal', href: '/', icon: '🏛️' },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/complaints') return pathname === '/complaints' && !pathname.includes('isFlagged');
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-bold">
            🏛️
          </div>
          <div>
            <h2 className="text-sm font-black text-white tracking-wider">OFFICER PORTAL</h2>
            <p className="text-[10px] text-blue-400 font-semibold uppercase">Jan-Samadhan Redressal</p>
          </div>
        </div>

        {/* User Info Card in Sidebar */}
        {session?.user && (
          <div className="p-4 mx-4 my-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
            <p className="font-bold text-white truncate">{session.user.name}</p>
            <p className="text-slate-400 text-[11px] truncate">{session.user.email}</p>
            <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-900 text-blue-200 uppercase tracking-wider">
              Role: {session.user.role}
            </span>
          </div>
        )}

        <nav className="flex-1 px-4 py-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                isActive(item.href)
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-200 text-xs font-semibold transition-colors"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              ☰
            </button>
            <h1 className="text-base sm:text-lg font-bold text-slate-800 truncate">
              {session?.user?.role === 'ADMIN' ? 'State Nodal Administrator' : 'Departmental Redressal Officer'}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Public View ↗
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
