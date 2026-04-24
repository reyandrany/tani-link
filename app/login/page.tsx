// tani-link/app/login/page.tsx
'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
    } else {
      router.push('/dashboard'); // Nanti kita buat halaman ini
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-6">
      <div className="w-full max-w-md rounded-lg border p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-green-700">Masuk TaniLink</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4 text-black">
          <input type="email" placeholder="Email" className="border p-2 rounded" onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" className="border p-2 rounded" onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="bg-green-600 text-white py-2 rounded font-semibold">
            Masuk
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          Belum punya akun?{' '}
          <a href="/register" className="text-green-600 underline">
            Daftar di sini
          </a>
        </p>
      </div>
    </div>
  );
}
