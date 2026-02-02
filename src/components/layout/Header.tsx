'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { 
  ShoppingCartIcon, 
  UserCircleIcon, 
  MusicalNoteIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useCartStore } from '@/stores/useCartStore';
import { useCreditStore } from '@/stores/useCreditStore';
import { formatPrice } from '@/lib/utils';
import { CartDrawer } from './CartDrawer';
import { InboxDropdown } from './InboxDropdown';

interface SubMenuItem {
  label: string;
  url: string;
}

interface MenuItem {
  label: string;
  url: string;
  children?: SubMenuItem[];
}

interface HeaderSettings {
  site_name: string;
  site_logo: string;
  site_description: string;
}

interface HeaderProps {
  initialSettings?: HeaderSettings;
  initialMenuItems?: MenuItem[];
}

// Default menu structure with dropdowns
const defaultMenuItems: MenuItem[] = [
  { label: 'หน้าหลัก', url: '/' },
  {
    label: 'สินค้าต่างๆ',
    url: '/products',
    children: [
      { label: 'สินค้าทั้งหมด', url: '/products' },
      { label: 'สินค้าแนะนำ', url: '/products?featured=true' },
      { label: 'สินค้าใหม่', url: '/products?sort=latest' },
    ]
  },
  {
    label: 'เติมเงิน',
    url: '/dashboard/wallet',
    children: [
      { label: 'เติมเครดิต', url: '/dashboard/wallet' },
      { label: 'ประวัติการเติม', url: '/dashboard/wallet/history' },
    ]
  },
  {
    label: 'เพิ่มเติม',
    url: '#',
    children: [
      { label: 'เกี่ยวกับเรา', url: '/about' },
      { label: 'ติดต่อเรา', url: '/contact' },
      { label: 'วิธีการสั่งซื้อ', url: '/how-to-order' },
    ]
  },
];

export function Header({ initialSettings, initialMenuItems }: HeaderProps) {
  const { data: session, status } = useSession();
  const cartItems = useCartStore((state) => state.items);
  const { creditBalance, fetchBalance } = useCreditStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  // Fetch credit balance when user is logged in
  useEffect(() => {
    if (session?.user?.id) {
      fetchBalance();
    }
  }, [session?.user?.id, fetchBalance]);

  const settings = initialSettings;
  const menuItems = initialMenuItems && initialMenuItems.length > 0 
    ? initialMenuItems 
    : defaultMenuItems;

  return (
    <header className="sticky top-0 z-40 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            {settings?.site_logo ? (
              <img
                src={settings.site_logo}
                alt={settings?.site_name || 'Logo'}
                className="w-24 h-24 rounded-xl object-contain"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center group-hover:animate-pulse-glow transition-all">
                <MusicalNoteIcon className="w-7 h-7 text-white" />
              </div>
            )}
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg leading-none">{settings?.site_name || '\u00A0'}</h1>
              <p className="text-xs text-gray-400">เป็นเว็บไซต์ที่ก่อตั้งขึ้นมาเพื่อจำหน่ายลูปดีเจและเพลงต่างๆ</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {menuItems.map((item, index) => (
              <div key={index} className="relative group">
                {item.children && item.children.length > 0 ? (
                  <>
                    {/* Dropdown Trigger */}
                    <button
                      className="flex items-center gap-1 px-4 py-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                    >
                      {item.label}
                      <ChevronDownIcon className="w-4 h-4 transition-transform group-hover:rotate-180" />
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="w-48 py-2 bg-gray-800/95 backdrop-blur-lg rounded-xl shadow-xl border border-white/10">
                        {item.children.map((child, childIndex) => (
                          <Link
                            key={childIndex}
                            href={child.url}
                            className="block px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.url}
                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Inbox - Only show when logged in */}
            {session && <InboxDropdown />}

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ShoppingCartIcon className="w-6 h-6" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-500 rounded-full flex items-center justify-center text-xs font-bold">
                  {cartItems.length}
                </span>
              )}
            </button>

            {/* User Menu */}
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
            ) : session ? (
              <div className="flex items-center gap-3">
                {/* Credit Balance */}
                <div className="hidden sm:block text-right">
                  <p className="text-xs text-gray-400">เครดิต</p>
                  <p className="text-sm font-semibold text-green-400">
                    {formatPrice(creditBalance)}
                  </p>
                </div>

                {/* User Dropdown */}
                <div className="relative group">
                  <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || ''}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <UserCircleIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-gray-800/95 backdrop-blur-lg rounded-xl shadow-xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="font-medium truncate">{session.user.name || session.user.email}</p>
                      <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
                    </div>

                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 hover:bg-white/10 transition-colors"
                    >
                      แดชบอร์ด
                    </Link>
                    <Link
                      href="/dashboard/orders"
                      className="block px-4 py-2 hover:bg-white/10 transition-colors"
                    >
                      ประวัติการสั่งซื้อ
                    </Link>
                    <Link
                      href="/dashboard/downloads"
                      className="block px-4 py-2 hover:bg-white/10 transition-colors"
                    >
                      ดาวน์โหลด
                    </Link>
                    <Link
                      href="/topup"
                      className="block px-4 py-2 hover:bg-white/10 transition-colors"
                    >
                      เติมเงิน
                    </Link>

                    {session.user.role === 'ADMIN' && (
                      <>
                        <div className="border-t border-white/10 my-2" />
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-accent-400 hover:bg-white/10 transition-colors"
                        >
                          Admin Panel
                        </Link>
                      </>
                    )}

                    <div className="border-t border-white/10 my-2" />
                    <button
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 text-red-400 hover:bg-white/10 transition-colors"
                    >
                      ออกจากระบบ
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm rounded-lg hover:bg-white/10 transition-colors"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm rounded-lg gradient-primary hover:opacity-90 transition-opacity"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-gray-900/95 backdrop-blur-lg">
          <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {menuItems.map((item, index) => (
              <div key={index}>
                {item.children && item.children.length > 0 ? (
                  <div>
                    <button
                      onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                      className="flex items-center justify-between w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <span>{item.label}</span>
                      <ChevronDownIcon 
                        className={`w-4 h-4 transition-transform ${
                          openDropdown === item.label ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>
                    {openDropdown === item.label && (
                      <div className="pl-4 space-y-1 mt-1">
                        {item.children.map((child, childIndex) => (
                          <Link
                            key={childIndex}
                            href={child.url}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-4 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.url}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
