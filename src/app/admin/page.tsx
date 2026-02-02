import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { getSetting } from '@/lib/settings';
import Link from 'next/link';
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  MusicalNoteIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

async function getStats() {
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    pendingTransactions,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count({ where: { status: 'COMPLETED' } }),
    prisma.transaction.count({ where: { status: 'PENDING', type: 'TOPUP' } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    }),
    prisma.product.findMany({
      take: 5,
      orderBy: { playCount: 'desc' },
    }),
  ]);

  const totalRevenue = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: { status: 'COMPLETED' },
  });

  return {
    totalUsers,
    totalProducts,
    totalOrders,
    pendingTransactions,
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    recentOrders,
    topProducts,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();
  const siteName = await getSetting('site_name');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-400">ภาพรวมของระบบ {siteName}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">รายได้ทั้งหมด</p>
              <p className="text-2xl font-bold text-green-400 mt-1">
                {formatPrice(stats.totalRevenue)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <CurrencyDollarIcon className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">คำสั่งซื้อสำเร็จ</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">
                {stats.totalOrders}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <ShoppingBagIcon className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Users */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">ผู้ใช้งาน</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">
                {stats.totalUsers}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Pending Transactions */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">รอตรวจสอบ</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">
                {stats.pendingTransactions}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          {stats.pendingTransactions > 0 && (
            <Link 
              href="/admin/transactions" 
              className="inline-block mt-3 text-xs text-yellow-400 hover:underline"
            >
              ตรวจสอบเลย →
            </Link>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="rounded-2xl bg-gray-900/50 border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <ShoppingBagIcon className="w-5 h-5 text-blue-400" />
              คำสั่งซื้อล่าสุด
            </h2>
            <Link href="/admin/orders" className="text-sm text-primary-400 hover:underline">
              ดูทั้งหมด
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order) => (
                <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/5">
                  <div>
                    <p className="font-medium">{order.user.name || order.user.email}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-semibold">{formatPrice(order.totalAmount)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      order.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                      order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                ยังไม่มีคำสั่งซื้อ
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-2xl bg-gray-900/50 border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <ArrowTrendingUpIcon className="w-5 h-5 text-green-400" />
              เพลงยอดนิยม
            </h2>
            <Link href="/admin/products" className="text-sm text-primary-400 hover:underline">
              ดูทั้งหมด
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {stats.topProducts.length > 0 ? (
              stats.topProducts.map((product, index) => (
                <div key={product.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/5">
                  <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <img
                    src={product.coverImage}
                    alt={product.title}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.title}</p>
                    <p className="text-sm text-gray-400 truncate">{product.artist}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">{product.playCount} plays</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                ยังไม่มีข้อมูล
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl bg-gray-900/50 border border-white/10 p-6">
        <h2 className="font-semibold mb-4">ทางลัด</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/admin/products/new"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary-500/50 transition-all"
          >
            <MusicalNoteIcon className="w-8 h-8 text-primary-400" />
            <span className="text-sm">เพิ่มสินค้า</span>
          </Link>
          <Link
            href="/admin/categories"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary-500/50 transition-all"
          >
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="text-sm">จัดการหมวดหมู่</span>
          </Link>
          <Link
            href="/admin/transactions"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary-500/50 transition-all"
          >
            <CurrencyDollarIcon className="w-8 h-8 text-green-400" />
            <span className="text-sm">ตรวจสอบการโอน</span>
          </Link>
          <Link
            href="/admin/users"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary-500/50 transition-all"
          >
            <UsersIcon className="w-8 h-8 text-blue-400" />
            <span className="text-sm">จัดการผู้ใช้</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
