'use client';

import { useSession } from 'next-auth/react';
import { BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export function AdminHeader() {
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-gray-900/50 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-6">
      {/* Left - Search */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหา..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
          <BellIcon className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User Info */}
        {session && (
          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{session.user.name}</p>
              <p className="text-xs text-gray-400">Admin</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
              {session.user.name?.charAt(0) || 'A'}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
