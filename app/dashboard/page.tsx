/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
// tani-link/app/dashboard/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [incomingOrders, setIncomingOrders] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newStock, setNewStock] = useState('number');

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
        products:product_id!inner (id, name, price, farmer_id)`,
      )
      .eq('products.farmer_id', userId)
      .order('created_at', { ascending: false });

    if (!error) setIncomingOrders(data);
  };

  const downloadReport = () => {
    const doc = new jsPDF();
    //1. judul laporan
    doc.text(`Laporan Penjualan TaniLink - ${profile?.full_name}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);

    //2. siapkan data tabel ( hanya yang statusnya confirmed/selesai)
    const reportData = incomingOrders
      .filter((order) => order.status === 'confirmed')
      .map((order, index) => [index + 1, new Date(order.created_at).toLocaleDateString('id-ID'), order.products?.name, order.buyer?.full_name, `${order.quantity} Kg`, `Rp ${(order.products?.price * order.quantity).toLocaleString()}`]);

    //3. buat tabel
    autoTable(doc, {
      startY: 30,
      head: [['No', 'Tanggal', 'Produk', 'Pembeli', 'Jumlah', 'Total Harga']],
      body: reportData,
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74] }, // warna hijau sukses
    });

    //4. download PDF
    doc.save(`Laporan_TaniLink_${profile?.full_name}.pdf`);
  };

  const fetchMyProducts = async (userId: string) => {
    const { data, error } = await supabase.from('products').select('*').eq('farmer_id', userId).order('harvest_date', { ascending: false });

    if (!error) setMyProducts(data);
  };

  useEffect(() => {
    const initData = async () => {
      // 1. Ambil Session (Cek Login)
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Jika tidak ada session, langsung lempar ke login
      if (!session) {
        router.push('/login');
        return;
      }

      // Simpan user login ke state
      const currentUser = session.user;
      setUser(currentUser);

      // 2. Ambil Profil (Cek Role)
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();

      if (profileData) {
        setProfile(profileData);

        // 3. Ambil data sesuai Role
        if (profileData.role === 'petani') {
          // Panggil fungsi fetch hanya untuk data si petani yang sedang login
          fetchIncomingOrders(currentUser.id);
          fetchMyProducts(currentUser.id);
        }
      }
    };

    initData();
  }, [router]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    let url = '';
    if (imageFile) {
      url = await uploadImage(imageFile);
    }

    const { error } = await supabase.from('products').insert([
      { name: productName, price: parseInt(price), stock: parseInt(stock), farmer_id: user.id, image_url: url }, // menghubungkan procuk ke petani yang login
    ]);

    if (error) {
      alert(error.message);
    } else {
      alert('Produk berhasil diposting!');
      setProductName('');
      setPrice('');
      setStock('');
      setImageFile(null);
      // Refresh products list
      fetchMyProducts(user.id);
    }
  };

  const handleDeleteProduct = async (productId: number, imageUrl: string) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;

    // 1. Hapus fotonya dari Storage (jika ada)
    if (imageUrl) {
      const fileName = imageUrl.split('/').pop(); // Ambil nama file dari URL
      await supabase.storage.from('product-images').remove([fileName!]);
    }

    // 2. Hapus datanya dari Database
    const { error } = await supabase.from('products').delete().eq('id', productId);

    if (error) {
      alert('Gagal menghapus: ' + error.message);
    } else {
      alert('Produk berhasil dihapus!');
      // Refresh data produk petani
      fetchMyProducts(user.id);
    }
  };

  const handleConfirmOrder = async (orderId: string, productId: number, quantity: number) => {
    try {
      // 1. Ambil stok terbaru dari produk tersebut
      const { data: product, error: fetchError } = await supabase.from('products').select('stock').eq('id', productId).single();

      if (fetchError) throw fetchError;

      // 2. Cek apakah stok cukup
      if (product.stock < quantity) {
        alert('Gagal: Stok tidak mencukupi untuk pesanan ini!');
        return;
      }

      // 3. Update Status Pesanan jadi 'confirmed'
      const { error: orderError } = await supabase.from('orders').update({ status: 'confirmed' }).eq('id', orderId);

      if (orderError) throw orderError;

      // 4. Kurangi Stok di tabel products
      const { error: stockError } = await supabase
        .from('products')
        .update({ stock: product.stock - quantity })
        .eq('id', productId);

      if (stockError) throw stockError;

      alert('Pesanan dikonfirmasi & stok otomatis berkurang!');

      // Refresh data dashboard
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        fetchIncomingOrders(session.user.id);
        fetchMyProducts(session.user.id); // Refresh juga daftar stok produk petani
      }
    } catch (error: any) {
      alert('Terjadi kesalahan: ' + error.message);
    }
  };

  const uploadImage = async (file: File) => {
    // Ganti nama file jadi angka unik biar aman dari karakter aneh
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = fileName; // JANGAN pake path yang ada foldernya dulu buat ngetes

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, error } = await supabase.storage.from('product-images').upload(filePath, file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from('product-images').getPublicUrl(filePath);

    return publicUrl;
  };

  const handleUpdateStock = async (productId: number) => {
    if (parseInt(newStock) < 0) return alert('Stok tidak boleh negatif!');

    const { error } = await supabase
      .from('products')
      .update({ stock: parseInt(newStock) })
      .eq('id', productId);

    if (error) {
      alert('Gagal update stok: ' + error.message);
    } else {
      alert('Stok berhasil diperbarui!');
      setEditingId(null); //tutup form edit
    }

    //refresh halaman
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      fetchMyProducts(session.user.id);
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
            <input type="file" accept="image/*" className="border p-2 rounded text-black bg-white" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            <button type="submit" className="bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700">
              Posting Hasil Bumi
            </button>
          </form>
        </div>
      )}

      {profile?.role === 'petani' && (
        <div className="mt-10 p-6 border-2 border-dashed border-green-200 rounded-xl bg-white">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Produk Anda di Pasar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myProducts.length === 0 ? (
              <p className="text-gray-500 italic">Anda belum memposting produk apapun.</p>
            ) : (
              myProducts.map((item) => (
                // Di dalam myProducts.map((item) => ...)
                <div key={item.id} className="border border-gray-400 p-4 rounded-lg flex flex-col gap-4 bg-white">
                  <div className="flex items-center gap-4">
                    <img src={item.image_url} className="w-16 h-16 object-cover rounded" alt="Produk" />
                    <div className="flex-1">
                      <p className="font-bold capitalize">{item.name}</p>

                      {/* Tampilan Kondisional: Edit vs View */}
                      {editingId === item.id ? (
                        <div className="flex items-center gap-2 mt-2">
                          <input type="number" className="border p-1 w-20 rounded text-black" value={newStock} onChange={(e) => setNewStock(String(parseInt(e.target.value)))} />
                          <button onClick={() => handleUpdateStock(item.id)} className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                            Simpan
                          </button>
                          <button onClick={() => setEditingId(null)} className="text-gray-500 text-xs underline">
                            Batal
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-500">Stok: {item.stock} kg</p>
                          <button
                            onClick={() => {
                              setEditingId(item.id);
                              setNewStock(item.stock);
                            }}
                            className="text-blue-600 text-xs font-bold underline"
                          >
                            Tambah/Ubah
                          </button>
                        </div>
                      )}
                    </div>

                    <button onClick={() => handleDeleteProduct(item.id, item.image_url)} className="text-red-500 text-sm font-bold">
                      Hapus
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {profile?.role === 'petani' && (
        <div className="mt-10 p-6 border-2 border-dashed border-green-200 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Pesanan Masuk dari Warga</h2>
            {incomingOrders.length > 0 && (
              <button onClick={downloadReport} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-blue-700 transition flex items-center gap-2">
                📄 Cetak Laporan PDF
              </button>
            )}
          </div>
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
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-green-700" onClick={() => handleConfirmOrder(order.id, order.products.id, order.quantity)}>
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
