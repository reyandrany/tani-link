// tani-link/components/Navbar.tsx
'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Cek status login saat ini
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    checkUser();

    // Pantau kalau ada login/logout biar navbar berubah otomatis
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <nav className="flex items-center justify-between p-4 bg-green-700 text-white shadow-md">
      <Link href="/" className="text-xl font-bold tracking-tight">
        TaniLink
      </Link>

      <div className="flex gap-6 items-center">
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
            <button onClick={() => supabase.auth.signOut().then(() => (window.location.href = '/login'))} className="bg-red-500 px-4 py-1 rounded-md text-sm hover:bg-red-600 transition">
              Keluar
            </button>
          </>
        ) : (
          <Link href="/login" className="bg-white text-green-700 px-4 py-1 rounded-md font-semibold">
            Masuk
          </Link>
        )}
      </div>
    </nav>
  );
}
