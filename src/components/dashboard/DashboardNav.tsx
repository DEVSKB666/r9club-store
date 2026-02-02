import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  HomeIcon,
  ShoppingBagIcon,
  ArrowDownTrayIcon,
  CreditCardIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const menuItems = [
  { title: 'ภาพรวม', icon: HomeIcon, href: '/dashboard' },
  { title: 'ประวัติการสั่งซื้อ', icon: ShoppingBagIcon, href: '/dashboard/orders' },
  { title: 'ดาวน์โหลด', icon: ArrowDownTrayIcon, href: '/dashboard/downloads' },
  { title: 'กระเป๋าเงิน', icon: CreditCardIcon, href: '/dashboard/wallet' },
  { title: 'โปรไฟล์', icon: UserIcon, href: '/dashboard/profile' },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 mb-8">
      {menuItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
              isActive
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-transparent'
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
