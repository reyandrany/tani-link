// tani-link/app/register/page.tsx
'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase'; // Memanggil config supabase kamu

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('pembeli');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Proses Sign Up ke Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role, // kirim data role ke metadata
        },
      },
    });

    if (error) {
      alert(error.message);
    } else {
      alert('Berhasil! Cek email kamu untuk verifikasi akun.');
      console.log(data);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-6">
      <div className="w-full max-w-md rounded-lg border p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-green-700">Daftar TaniLink</h1>
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input type="text" placeholder="Nama Lengkap" className="rounded border p-2 text-black outline-none focus:ring-2 focus:ring-green-500" onChange={(e) => setFullName(e.target.value)} required />
          <input type="email" placeholder="Email" className="rounded border p-2 text-black outline-none focus:ring-2 focus:ring-green-500" onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" className="rounded border p-2 text-black outline-none focus:ring-2 focus:ring-green-500" onChange={(e) => setPassword(e.target.value)} required />
          <select className="rounded border p-2 text-black outline-none focus:ring-2 focus:ring-green-500 bg-white" onChange={(e) => setRole(e.target.value)} value={role}>
            <option value="pembeli">Saya adalah Pembeli (Warga)</option>
            <option value="petani">Saya adalah Petani (Penyedia Hasil Bumi)</option>
          </select>
          <button type="submit" className="rounded bg-green-600 py-2 font-semibold text-white hover:bg-green-700 transition">
            Daftar
          </button>
          <p className="text-center text-gray-600 text-sm">
            Sudah punya akun?
            <a href="/login" className="ml-1 text-center text-green-600 hover:underline">
              Masuk
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
