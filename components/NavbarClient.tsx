'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NavbarClient() {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="px-4 pt-4 relative z-50">
      <nav className="bg-transparent backdrop-blur-md border border-white/20 rounded-xl shadow-lg max-w-5xl mx-auto">
        <div className="px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-6">
              <Link href="/" className="text-white text-lg font-bold">
                Terra Chrome
              </Link>
              <div className="hidden md:flex space-x-5">
                <Link
                  href="/"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/' ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Ana Sayfa
                </Link>
                <Link
                  href="/filmler"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/movies' ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Filmler
                </Link>
                <Link
                  href="/diziler"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/diziler' ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Diziler
                </Link>
              </div>
            </div>

            <div className="flex items-center">
              <div 
                className="relative"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <div 
                  onClick={() => router.push('/profile')}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-white to-gray-400 flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-black"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div 
                  className={`z-[9999] absolute right-0 mt-2 w-40 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg py-1.5 transition-all duration-200 ${
                    isDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                  }`}
                >
                  <button
                    onClick={() => router.push('/profile')}
                    className="block w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    Profil
                  </button>
                  <button
                    onClick={async () => {
                      await fetch('/api/auth/logout', { method: 'POST' });
                      router.push('/login');
                    }}
                    className="block w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    Çıkış Yap
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
} 