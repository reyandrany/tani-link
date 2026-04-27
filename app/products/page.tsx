/* eslint-disable @typescript-eslint/no-explicit-any */
// tani-link/app/products/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ProductsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const handleOrder = async (productId: number) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      alert('Silakan login dulu untuk memesan!');
      return;
    }

    // 1. Cari data produk di state lokal untuk cek stoknya
    const product = items.find((i) => i.id === productId);

    const quantityInput = prompt(`Stok tersedia: ${product.stock} kg. Mau pesan berapa Kg?`, '1');
    const quantity = parseInt(quantityInput || '0');

    // 2. VALIDASI: Cek input kosong atau nol
    if (isNaN(quantity) || quantity <= 0) {
      alert('Jumlah pesanan tidak valid!');
      return;
    }

    // 3. VALIDASI: Cek apakah pesanan melebihi stok
    if (quantity > product.stock) {
      alert(`Maaf, stok tidak mencukupi. Maksimal pembelian adalah ${product.stock} kg.`);
      return;
    }

    // 4. Jika lolos validasi, baru kirim ke Database
    const { error } = await supabase.from('orders').insert({
      product_id: productId,
      buyer_id: session.user.id,
      quantity: quantity,
    });

    if (error) {
      alert(error.message);
    } else {
      alert('Booking berhasil!');
      // Open WhatsApp with order details
      const item = items.find((i) => i.id === productId);
      if (item && item.profiles?.phone_number) {
        const waNumber = item.profiles?.phone_number; // ambil no  wa petani
        const message = `Halo! Saya pesan ${quantity} Kg ${item.name} di TaniLink.`;

        window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, '_blank');
      } else {
        alert('Nomor WhatsApp petani tidak ditemukan.');
      }
    }
  };

  useEffect(() => {
    const fetchProductsAndUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);

      const { data, error } = await supabase.from('products').select(`*, profiles:farmer_id (full_name, phone_number)`);

      if (!error) setItems(data);
      setLoading(false);
    };
    fetchProductsAndUser();
  }, []);

  if (loading) return <p className="p-10 text-black">Memuat hasil tani...</p>;

  const filteredItems = items.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <h1 className="text-3xl font-bold text-green-800 mb-8 text-center">Etalase Hasil Bumi Desa</h1>
      <div className="max-w-md mx-auto mb-10">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari sayur atau buah... (misal: Cabai)"
            className="w-full p-4 pl-10 rounded-full border border-green-200 shadow-sm focus:ring-2 focus:ring-green-500 outline-none text-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-4 top-4 text-gray-400">🔍</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border border-green-100 hover:shadow-md transition">
            {/* INFO PRODUK */}
            {item.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image_url} alt={item.name} className="w-full h-48 object-cover rounded-lg mb-4" />
            ) : (
              <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-400">Tanpa Foto</span>
              </div>
            )}
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-800 capitalize">{item.name}</h2>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold uppercase">Siap Panen</span>
            </div>
            <div className="space-y-2 mb-6 text-left">
              <p className="text-2xl font-bold text-green-600">
                Rp {item.price?.toLocaleString()}
                <span className="text-sm text-gray-400 font-normal"> /kg</span>
              </p>
              <div className="flex items-center gap-2 text-xs text-orange-600 font-bold mb-2">
                <span>📅 Panen: {item.harvest_date ? new Date(item.harvest_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Segera'}</span>
              </div>
              <p className="text-sm text-gray-600">
                Stok: <strong>{item.stock} kg</strong>
              </p>
              <p className="text-sm text-gray-500">Petani: {item.profiles?.full_name}</p>
            </div>
            {/* LOGIKA TOMBOL LANGSUNG DI SINI (TANPA MAP LAGI) */}
            <div className="mt-4">
              {item.stock <= 0 ? (
                <button disabled className="w-full bg-gray-100 text-gray-400 py-2 rounded-lg font-bold cursor-not-allowed border border-gray-200">
                  Stok Habis
                </button>
              ) : (
                <>
                  {currentUser && item.farmer_id === currentUser.id ? (
                    <button disabled className="w-full bg-gray-100 text-gray-400 py-2 rounded-lg font-bold cursor-not-allowed border border-gray-200">
                      Produk Anda Sendiri
                    </button>
                  ) : (
                    <button onClick={() => handleOrder(item.id)} className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition">
                      Pre-Order Sekarang
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
