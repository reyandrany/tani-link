// tani-link/app/my-orders/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function MyOrdersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyOrders = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const { data, error } = await supabase
          .from('orders')
          .select(
            `
            id,
            quantity,
            status,
            created_at,
            products (
              name,
              price
            )
          `,
          )
          .eq('buyer_id', session.user.id)
          .order('created_at', { ascending: false });

        if (!error) setOrders(data);
      }
      setLoading(false);
    };

    fetchMyOrders();
  }, []);

  if (loading) return <p className="p-10 text-black">Memuat riwayat pesanan...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black text-center">
      <h1 className="text-2xl font-bold mb-6">Riwayat Pre-Order Saya</h1>

      <div className="max-w-2xl mx-auto space-y-4">
        {orders.length === 0 ? (
          <p className="text-gray-500">Belum ada pesanan.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
              <div className="text-left">
                <h3 className="font-bold text-lg capitalize">{order.products?.name}</h3>
                <p className="text-sm text-gray-600">
                  {order.quantity} Kg x Rp {order.products?.price.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('id-ID')}</p>
              </div>
              <div className="text-right">
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold uppercase">{order.status}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
