/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false); // State untuk menu mobile
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-green-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-extrabold tracking-tighter flex items-center gap-2">
            <span>🌱</span> Tani<span className="text-green-300">Link</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 font-medium">
            <Link href="/products" className="hover:text-green-200 transition">
              Pasar Desa
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="hover:text-green-200 transition">
                  Dashboard
                </Link>
                <Link href="/my-orders" className="hover:text-green-200 transition">
                  Pesanan Saya
                </Link>
                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl text-sm transition">
                  Keluar
                </button>
              </>
            ) : (
              <Link href="/login" className="bg-white text-green-700 px-5 py-2 rounded-xl font-bold hover:bg-green-50 transition text-sm">
                Masuk
              </Link>
            )}
          </div>

          {/* Mobile Toggle Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none text-2xl">
              {isOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Tampil saat isOpen true) */}
      {isOpen && (
        <div className="md:hidden bg-green-800 border-t border-green-600 px-4 pt-2 pb-6 space-y-2 animate-fade-in-down">
          <Link href="/products" onClick={() => setIsOpen(false)} className="block py-3 hover:text-green-200 border-b border-green-700">
            Pasar Desa
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setIsOpen(false)} className="block py-3 hover:text-green-200 border-b border-green-700">
                Dashboard
              </Link>
              <Link href="/my-orders" onClick={() => setIsOpen(false)} className="block py-3 hover:text-green-200 border-b border-green-700">
                Pesanan Saya
              </Link>
              <button onClick={handleLogout} className="w-full text-left py-3 text-red-300 font-bold">
                Keluar
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setIsOpen(false)} className="block py-3 font-bold text-green-300">
              Masuk / Daftar
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
