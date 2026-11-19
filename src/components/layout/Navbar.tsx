'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;
  const isOfficer = session?.user?.role === 'ADMIN' || session?.user?.role === 'DEPT_OFFICER';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* Top Gov Tricolor Bar */}
      <div className="h-1 bg-gradient-to-r from-orange-500 via-white to-green-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center text-xl shadow-sm group-hover:scale-105 transition-transform">
              🏛️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                  JAN-SAMADHAN
                </span>
                <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                  AI-PORTAL
                </span>
              </div>
              <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">
                Smart Grievance Redressal System
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              href="/"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
              }`}
            >
              Home
            </Link>

            <Link
              href="/submit"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/submit')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
              }`}
            >
              File Grievance
            </Link>

            <Link
              href="/track"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                pathname.startsWith('/track')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
              }`}
            >
              Track Status
            </Link>

            {session && (
              <Link
                href="/my-complaints"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive('/my-complaints')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
                }`}
              >
                My Grievances
              </Link>
            )}

            {isOfficer && (
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  pathname.startsWith('/dashboard') || pathname.startsWith('/complaints')
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
                }`}
              >
                Officer Dashboard ⚡
              </Link>
            )}
          </nav>

          {/* User Auth Section */}
          <div className="hidden md:flex items-center space-x-3">
            {session ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">{session.user.name}</p>
                  <span className="text-[10px] uppercase font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                    {session.user.role}
                  </span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-xs font-semibold px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="text-sm font-semibold px-4 py-2 text-gray-700 hover:text-blue-700 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-4 space-y-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Home
          </Link>
          <Link
            href="/submit"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            File Grievance
          </Link>
          <Link
            href="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Track Status
          </Link>
          {session && (
            <Link
              href="/my-complaints"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              My Grievances
            </Link>
          )}
          {isOfficer && (
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-indigo-700 bg-indigo-50"
            >
              Officer Dashboard ⚡
            </Link>
          )}

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            {session ? (
              <>
                <div>
                  <p className="text-xs font-bold text-gray-900">{session.user.name}</p>
                  <p className="text-[10px] text-gray-500">{session.user.role}</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-xs font-semibold px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex space-x-2 w-full">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-semibold border border-gray-300 rounded-lg"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-semibold bg-blue-700 text-white rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
