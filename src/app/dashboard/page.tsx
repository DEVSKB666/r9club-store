import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { getSetting } from '@/lib/settings';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingBagIcon,
  ArrowDownTrayIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login?callbackUrl=/dashboard');
  }

  // Get user stats
  const [user, ordersCount, downloadsCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
    }),
    prisma.order.count({
      where: { userId: session.user.id, status: 'COMPLETED' },
    }),
    prisma.download.count({
      where: { userId: session.user.id },
    }),
  ]);

  // Get recent orders
  const recentOrders = await prisma.order.findMany({
    where: { userId: session.user.id },
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  const siteName = await getSetting('site_name');

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">สวัสดี, {session.user.name || 'คุณสมาชิก'}! 👋</h1>
        <p className="text-gray-400 mt-1">ยินดีต้อนรับสู่ {siteName}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Credit Balance */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <CreditCardIcon className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">เครดิตคงเหลือ</p>
              <p className="text-2xl font-bold text-green-400">
                {formatPrice(user?.creditBalance || 0)}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/wallet"
            className="inline-block mt-4 text-sm text-green-400 hover:underline"
          >
            เติมเงิน →
          </Link>
        </div>

        {/* Orders */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <ShoppingBagIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">คำสั่งซื้อ</p>
              <p className="text-2xl font-bold text-blue-400">{ordersCount}</p>
            </div>
          </div>
          <Link
            href="/dashboard/orders"
            className="inline-block mt-4 text-sm text-blue-400 hover:underline"
          >
            ดูประวัติ →
          </Link>
        </div>

        {/* Downloads */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <ArrowDownTrayIcon className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">เพลงที่ซื้อ</p>
              <p className="text-2xl font-bold text-purple-400">{downloadsCount}</p>
            </div>
          </div>
          <Link
            href="/dashboard/downloads"
            className="inline-block mt-4 text-sm text-purple-400 hover:underline"
          >
            ดาวน์โหลด →
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-2xl bg-gray-900/50 border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-semibold">คำสั่งซื้อล่าสุด</h2>
          <Link href="/dashboard/orders" className="text-sm text-primary-400 hover:underline">
            ดูทั้งหมด
          </Link>
        </div>
        
        {recentOrders.length > 0 ? (
          <div className="divide-y divide-white/5">
            {recentOrders.map((order) => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item) => (
                      <img
                        key={item.id}
                        src={item.product.coverImage}
                        alt={item.product.title}
                        className="w-10 h-10 rounded-lg border-2 border-gray-900 object-cover"
                      />
                    ))}
                  </div>
                  <div>
                    <p className="font-medium">
                      {order.items.length} เพลง
                    </p>
                    <p className="text-sm text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-semibold">
                    {formatPrice(order.totalAmount)}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
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
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-500">
            <ShoppingBagIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>ยังไม่มีคำสั่งซื้อ</p>
            <Link href="/products" className="inline-block mt-3 text-primary-400 hover:underline">
              เลือกซื้อเพลง →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
