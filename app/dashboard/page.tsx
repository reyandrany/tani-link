/* eslint-disable @typescript-eslint/no-explicit-any */
// tani-link/app/dashboard/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [incomingOrders, setIncomingOrders] = useState<any[]>([]);
  const fetchIncomingOrders = async (userId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        id,
        quantity,
        status,
        created_at,
        buyer:buyer_id (full_name, phone_number),
        products!inner (id, name, farmer_id)`,
      )
      .eq('products.farmer_id', userId)
      .order('created_at', { ascending: false });

    if (!error) setIncomingOrders(data);
  };

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login'); // Tendang ke login kalau belum masuk
        return;
      }

      setUser(session.user);

      fetchIncomingOrders(session.user.id); // Ambil pesanan masuk untuk petani yang login

      // Ambil data profil tambahan dari tabel profiles
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();

      setProfile(profileData);
    };
    getSession();
  }, [router]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('products').insert([
      { name: productName, price: parseInt(price), stock: parseInt(stock), farmer_id: user.id }, // menghubungkan procuk ke petani yang login
    ]);

    if (error) {
      alert(error.message);
    } else {
      alert('Produk berhasil diposting!');
      setProductName('');
      setPrice('');
      setStock('');
    }
  };

  const handleConfirmOrder = async (orderId: string) => {
    const { error } = await supabase.from('orders').update({ status: 'confirmed' }).eq('id', orderId);

    if (error) {
      alert('Gagal konfirmasi: ' + error.message);
    } else {
      alert('Pesanan berhasil dikonfirmasi!');

      // Refresh data agar tampilan status berubah tanpa reload halaman
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) fetchIncomingOrders(session.user.id);
    }
  };

  if (!user) return <p className="p-10 text-black">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-green-700">Selamat Datang, {profile?.full_name || 'User'}!</h1>
        <p className="text-gray-600">Email: {user.email}</p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border p-4 rounded-lg bg-green-50">
            <h2 className="font-bold text-green-800 mb-2">Status Akun</h2>
            <p>
              Anda terdaftar sebagai: <span className="font-semibold uppercase">{profile?.role || 'Belum diatur'}</span>
            </p>
          </div>
        </div>
      </div>

      {profile?.role === 'petani' && (
        <div className="mt-10 p-6 border-2 border-dashed border-green-200 rounded-xl">
          <h2 className="text-xl font-bold text-green-800 mb-4">Tambah Hasil Panen</h2>
          <form onSubmit={handleAddProduct} className="flex flex-col gap-3">
            <input type="text" placeholder="Nama Sayur/Buah (Contoh: Tomat)" className="border p-2 rounded text-black" value={productName} onChange={(e) => setProductName(e.target.value)} required />
            <div className="flex gap-2">
              <input type="number" placeholder="Harga per Kg" className="border p-2 rounded flex-1 text-black" value={price} onChange={(e) => setPrice(e.target.value)} required />
              <input type="number" placeholder="Stok (Kg)" className="border p-2 rounded flex-1 text-black" value={stock} onChange={(e) => setStock(e.target.value)} required />
            </div>
            <button type="submit" className="bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700">
              Posting Hasil Bumi
            </button>
          </form>
        </div>
      )}
      {profile?.role === 'petani' && (
        <div className="mt-10 p-6 border-2 border-dashed border-green-200 rounded-xl">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Pesanan Masuk dari Warga</h2>
          <div className="space-y-4">
            {incomingOrders.length === 0 ? (
              <p className="text-gray-500 italic">Belum ada pesanan masuk.</p>
            ) : (
              incomingOrders.map((order) => (
                <div key={order.id} className="bg-white border-l-4 border-green-500 p-4 shadow-sm flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-700 capitalize">{order.products?.name}</p>
                    <p className="text-sm text-gray-600">
                      Pemesan: <span className="font-semibold">{order.buyer?.full_name}</span> ({order.quantity} Kg)
                    </p>
                    <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('id-ID')}</p>
                  </div>

                  <div className="flex gap-2">
                    <a href={`https://wa.me/${order.buyer?.phone_number}`} target="_blank" className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-bold">
                      Chat WA
                    </a>

                    {order.status === 'pending' ? (
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-green-700" onClick={() => handleConfirmOrder(order.id)}>
                        Konfirmasi
                      </button>
                    ) : (
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-bold">Dikonfirmasi</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
