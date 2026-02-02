import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function OrdersHistoryPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login?callbackUrl=/dashboard/orders');
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ประวัติการสั่งซื้อ</h1>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl bg-gray-900/50 border border-white/10 overflow-hidden">
              {/* Order Header */}
              <div className="px-6 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 bg-white/5">
                <div>
                  <p className="text-sm text-gray-400">
                    {new Date(order.createdAt).toLocaleString('th-TH')}
                  </p>
                  <p className="font-mono text-xs text-gray-500 mt-1">
                    ID: {order.id}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-400">
                    {formatPrice(order.totalAmount)}
                  </p>
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                    order.status === 'COMPLETED'
                      ? 'bg-green-500/20 text-green-400'
                      : order.status === 'PENDING'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {order.status === 'COMPLETED' ? 'สำเร็จ' : 
                     order.status === 'PENDING' ? 'รอดำเนินการ' : 'ยกเลิก'}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="divide-y divide-white/5">
                {order.items.map((item) => (
                  <div key={item.id} className="px-6 py-4 flex items-center gap-4">
                    <img
                      src={item.product.coverImage}
                      alt={item.product.title}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.product.id}`}
                        className="font-medium hover:text-primary-400"
                      >
                        {item.product.title}
                      </Link>
                      <p className="text-sm text-gray-400">{item.product.artist}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400">{formatPrice(item.price)}</p>
                      {order.status === 'COMPLETED' && (
                        <Link
                          href="/dashboard/downloads"
                          className="text-xs text-primary-400 hover:underline"
                        >
                          ดาวน์โหลด
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-gray-900/50 border border-white/10 px-6 py-16 text-center">
          <p className="text-gray-500 mb-4">ยังไม่มีประวัติการสั่งซื้อ</p>
          <Link
            href="/products"
            className="inline-block px-6 py-2 rounded-lg gradient-primary text-white"
          >
            เลือกซื้อเพลง
          </Link>
        </div>
      )}
    </div>
  );
}
