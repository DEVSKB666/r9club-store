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
  ArrowDownTrayIcon,
  UserPlusIcon,
  BanknotesIcon,
  ChartBarIcon,
  BellAlertIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';
import RevenueChart from '@/components/admin/RevenueChart';
import ActivityFeed, { ActivityItem } from '@/components/admin/ActivityFeed';
import SystemStatus from '@/components/admin/SystemStatus';

async function getStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const [
    totalUsers,
    totalProducts,
    totalOrders,
    pendingTransactions,
    recentOrders,
    topProducts,
    // New stats
    downloadsToday,
    todaySales,
    yesterdaySales,
    newUsersToday,
    recentUsers,
    pendingTopupAmount,
    approvedTopupToday,
    mediaCount,
    // Revenue chart data (last 7 days)
    last7DaysOrders,
    // Activity data
    recentSignups,
    recentTopups,
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
    // Downloads today
    prisma.download.count({
      where: { createdAt: { gte: todayStart } },
    }),
    // Today's sales
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: 'COMPLETED', createdAt: { gte: todayStart } },
    }),
    // Yesterday's sales
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { 
        status: 'COMPLETED', 
        createdAt: { gte: yesterdayStart, lt: todayStart } 
      },
    }),
    // New users today
    prisma.user.count({
      where: { createdAt: { gte: todayStart } },
    }),
    // Recent users (5)
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, image: true, createdAt: true },
    }),
    // Pending topup amount
    prisma.topupTransaction.aggregate({
      _sum: { amount: true },
      where: { status: 'PENDING' },
    }),
    // Approved topup today
    prisma.topupTransaction.aggregate({
      _sum: { amount: true },
      where: { status: 'COMPLETED', verifiedAt: { gte: todayStart } },
    }),
    // Media count
    prisma.media.count(),
    // Last 7 days orders for chart
    prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      select: { totalAmount: true, createdAt: true },
    }),
    // Recent signups for activity (3)
    prisma.user.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, createdAt: true },
    }),
    // Recent topups for activity (3)
    prisma.topupTransaction.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  const totalRevenue = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: { status: 'COMPLETED' },
  });

  // Calculate revenue change percentage
  const todaySalesAmount = todaySales._sum.totalAmount || 0;
  const yesterdaySalesAmount = yesterdaySales._sum.totalAmount || 0;
  const salesChangePercent = yesterdaySalesAmount > 0 
    ? ((todaySalesAmount - yesterdaySalesAmount) / yesterdaySalesAmount) * 100 
    : 0;

  // Process last 7 days for chart
  const revenueChartData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    
    const dayRevenue = last7DaysOrders
      .filter(order => order.createdAt >= dayStart && order.createdAt < dayEnd)
      .reduce((sum, order) => sum + order.totalAmount, 0);
    
    revenueChartData.push({
      date: dayStart.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
      revenue: dayRevenue,
    });
  }

  // Build activity feed
  const activities: ActivityItem[] = [];
  
  // Add recent orders
  recentOrders.slice(0, 3).forEach(order => {
    activities.push({
      id: `order-${order.id}`,
      type: 'order',
      message: `${order.user.name || order.user.email} สั่งซื้อสินค้า`,
      timestamp: order.createdAt,
      amount: order.totalAmount,
    });
  });

  // Add recent signups
  recentSignups.forEach(user => {
    activities.push({
      id: `signup-${user.id}`,
      type: 'signup',
      message: `${user.name || user.email} สมัครสมาชิกใหม่`,
      timestamp: user.createdAt,
    });
  });

  // Add recent topups
  recentTopups.forEach(topup => {
    const statusType = topup.status === 'COMPLETED' ? 'topup_approved' 
      : topup.status === 'REJECTED' ? 'topup_rejected' : 'topup';
    const statusText = topup.status === 'COMPLETED' ? 'เติมเงินสำเร็จ' 
      : topup.status === 'REJECTED' ? 'เติมเงินถูกปฏิเสธ' : 'ขอเติมเงิน';
    
    activities.push({
      id: `topup-${topup.id}`,
      type: statusType,
      message: `${topup.user.name || topup.user.email} ${statusText}`,
      timestamp: topup.createdAt,
      amount: topup.amount,
    });
  });

  // Sort by timestamp descending
  activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return {
    totalUsers,
    totalProducts,
    totalOrders,
    pendingTransactions,
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    recentOrders,
    topProducts,
    // New stats
    downloadsToday,
    todaySalesAmount,
    salesChangePercent,
    newUsersToday,
    recentUsers,
    pendingTopupAmount: pendingTopupAmount._sum.amount || 0,
    approvedTopupToday: approvedTopupToday._sum.amount || 0,
    mediaCount,
    revenueChartData,
    activities: activities.slice(0, 10),
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

      {/* Stats Cards - Row 1 */}
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

        {/* Today Sales */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">ยอดขายวันนี้</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {formatPrice(stats.todaySalesAmount)}
              </p>
              {stats.salesChangePercent !== 0 && (
                <p className={`text-xs mt-1 ${stats.salesChangePercent > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.salesChangePercent > 0 ? '+' : ''}{stats.salesChangePercent.toFixed(1)}% จากเมื่อวาน
                </p>
              )}
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <ArrowTrendingUpIcon className="w-6 h-6 text-emerald-400" />
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

      {/* Stats Cards - Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Users */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">ผู้ใช้งานทั้งหมด</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">
                {stats.totalUsers}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        {/* New Users Today */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/20 to-pink-600/10 border border-pink-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">ผู้ใช้ใหม่วันนี้</p>
              <p className="text-2xl font-bold text-pink-400 mt-1">
                {stats.newUsersToday}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <UserPlusIcon className="w-6 h-6 text-pink-400" />
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">สินค้าทั้งหมด</p>
              <p className="text-2xl font-bold text-cyan-400 mt-1">
                {stats.totalProducts}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <MusicalNoteIcon className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* Downloads Today */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">ดาวน์โหลดวันนี้</p>
              <p className="text-2xl font-bold text-orange-400 mt-1">
                {stats.downloadsToday}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <ArrowDownTrayIcon className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart + Topup Summary */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-gray-900/50 border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-green-400" />
              รายได้ 7 วันล่าสุด
            </h2>
          </div>
          <div className="p-6">
            <RevenueChart data={stats.revenueChartData} />
          </div>
        </div>

        {/* Topup Summary */}
        <div className="rounded-2xl bg-gray-900/50 border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="font-semibold flex items-center gap-2">
              <BanknotesIcon className="w-5 h-5 text-yellow-400" />
              สรุปการเติมเงิน
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-gray-400">รอตรวจสอบ</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">
                {formatPrice(stats.pendingTopupAmount)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{stats.pendingTransactions} รายการ</p>
            </div>
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-gray-400">อนุมัติวันนี้</p>
              <p className="text-2xl font-bold text-green-400 mt-1">
                {formatPrice(stats.approvedTopupToday)}
              </p>
            </div>
            <Link
              href="/admin/transactions"
              className="block w-full text-center py-3 rounded-xl bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors"
            >
              ตรวจสอบการโอน →
            </Link>
          </div>
        </div>
      </div>

      {/* Content Grid - Orders + Products */}
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

      {/* Activity Feed + Recent Users + System Status */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="rounded-2xl bg-gray-900/50 border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="font-semibold flex items-center gap-2">
              <BellAlertIcon className="w-5 h-5 text-orange-400" />
              กิจกรรมล่าสุด
            </h2>
          </div>
          <div className="p-4">
            <ActivityFeed activities={stats.activities} />
          </div>
        </div>

        {/* Recent Users */}
        <div className="rounded-2xl bg-gray-900/50 border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <UserPlusIcon className="w-5 h-5 text-pink-400" />
              ผู้ใช้ล่าสุด
            </h2>
            <Link href="/admin/users" className="text-sm text-primary-400 hover:underline">
              ดูทั้งหมด
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {stats.recentUsers.map((user) => (
              <div key={user.id} className="px-6 py-4 flex items-center gap-3 hover:bg-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {(user.name || user.email)?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.name || 'ไม่ระบุ'}</p>
                  <p className="text-sm text-gray-400 truncate">{user.email}</p>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString('th-TH')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="rounded-2xl bg-gray-900/50 border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="font-semibold flex items-center gap-2">
              <CpuChipIcon className="w-5 h-5 text-indigo-400" />
              สถานะระบบ
            </h2>
          </div>
          <div className="p-4">
            <SystemStatus
              items={[
                { name: 'Database', status: 'online' },
                { name: 'API', status: 'online' },
                { name: 'Media Storage', status: 'online' },
                { name: 'Server', status: 'online' },
              ]}
              mediaCount={stats.mediaCount}
              mediaSize="N/A"
            />
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
