/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center bg-green-900 overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Farm Background"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
            Tani<span className="text-green-400">Link</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-10 leading-relaxed">Hubungkan dapur Anda langsung ke kebun petani desa. Segar, Murah, dan Tanpa Perantara.</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:scale-105">
              Mulai Gabung Sekarang
            </Link>
            <Link href="/products" className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-full font-bold text-lg transition-all">
              Lihat Pasar Desa
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="p-6">
            <div className="text-4xl mb-4">🌱</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Langsung Panen</h3>
            <p className="text-gray-600">Produk dipesan sebelum panen, menjamin kesegaran maksimal saat tiba di tangan Anda.</p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Harga Adil</h3>
            <p className="text-gray-600">Menghapus rantai tengkulak sehingga petani untung lebih banyak dan pembeli bayar lebih murah.</p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Integrasi WA</h3>
            <p className="text-gray-600">Diskusi langsung dengan petani melalui WhatsApp untuk kepastian stok dan pengiriman.</p>
          </div>
        </div>
      </section>

      {/* Footer Minimalis */}
      <footer className="bg-gray-900 text-gray-300 py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Kolom Branding */}
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-2xl font-bold text-white mb-4">
              🌱 Tani<span className="text-green-400">Link</span>
            </h2>
            <p className="text-sm leading-relaxed">Mendukung ekonomi lokal dengan menghubungkan petani desa langsung ke pelanggan perkotaan.</p>
          </div>

          {/* Kolom Navigasi */}
          <div>
            <h4 className="text-white font-bold mb-4">Navigasi</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:text-green-400 transition">
                  Pasar Desa
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-green-400 transition">
                  Daftar Petani
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-green-400 transition">
                  Masuk Akun
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom Bantuan */}
          <div>
            <h4 className="text-white font-bold mb-4">Bantuan</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-green-400 transition">
                  Cara Kerja
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-400 transition">
                  Syarat & Ketentuan
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-400 transition">
                  Kebijakan Privasi
                </a>
              </li>
            </ul>
          </div>

          {/* Kolom Kontak */}
          <div>
            <h4 className="text-white font-bold mb-4">Kontak Kami</h4>
            <p className="text-sm mb-2">📍 Desa Sitiharjo Kec. Tugumulyo Kab. Musirawas, Indonesia</p>
            <p className="text-sm">📧 bantuan@tanilink.id</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto border-t border-gray-800 mt-12 pt-8 text-center text-xs">
          <p>© {new Date().getFullYear()} TaniLink. Dibuat dengan ❤️ untuk Petani Indonesia.</p>
        </div>
      </footer>
    </div>
  );
}
