'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  HomeIcon,
  MusicalNoteIcon,
  UsersIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  TagIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowLeftOnRectangleIcon,
  ChevronDownIcon,
  PhotoIcon,
  MegaphoneIcon,
  RectangleStackIcon,
  SparklesIcon,
  UserGroupIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';

const menuItems = [
  {
    title: 'Dashboard',
    icon: HomeIcon,
    href: '/admin',
  },
  {
    title: 'จัดการสินค้า',
    icon: MusicalNoteIcon,
    href: '/admin/products',
  },
  {
    title: 'หมวดหมู่',
    icon: TagIcon,
    href: '/admin/categories',
  },
  {
    title: 'Media Library',
    icon: PhotoIcon,
    href: '/admin/media',
  },
  {
    title: 'สไลด์โปรโมชั่น',
    icon: RectangleStackIcon,
    href: '/admin/slides',
  },
  {
    title: 'ประกาศ',
    icon: MegaphoneIcon,
    href: '/admin/announcements',
  },
  {
    title: 'แพ็คสมาชิก',
    icon: SparklesIcon,
    href: '/admin/plans',
  },
  {
    title: 'ทีมงาน',
    icon: UserGroupIcon,
    href: '/admin/team',
  },
  {
    title: 'FAQ',
    icon: QuestionMarkCircleIcon,
    href: '/admin/faqs',
  },
  {
    title: 'การชำระเงิน',
    icon: CreditCardIcon,
    href: '/admin/payment-settings',
  },
  {
    title: 'คำสั่งซื้อ',
    icon: ShoppingBagIcon,
    href: '/admin/orders',
  },
  {
    title: 'ผู้ใช้งาน',
    icon: UsersIcon,
    href: '/admin/users',
  },
  {
    title: 'รายการเติมเงิน',
    icon: CreditCardIcon,
    href: '/admin/transactions',
  },
  {
    title: 'ตั้งค่า',
    icon: Cog6ToothIcon,
    href: '/admin/settings',
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-800 text-white"
      >
        <Bars3Icon className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-gray-900 border-r border-white/10 transition-all duration-300',
          isCollapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          {!isCollapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <MusicalNoteIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">R9Admin</span>
            </Link>
          )}

          {/* Mobile Close */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1 hover:bg-white/10 rounded"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block p-1 hover:bg-white/10 rounded"
          >
            <ChevronDownIcon
              className={cn(
                'w-5 h-5 transition-transform',
                isCollapsed ? '-rotate-90' : 'rotate-90'
              )}
            />
          </button>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                  isActive
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="text-sm">{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          {session && !isCollapsed && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                {session.user.name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{session.user.name}</p>
                <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
              </div>
            </div>
          )}
          
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors',
              isCollapsed && 'justify-center'
            )}
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm">ออกจากระบบ</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
