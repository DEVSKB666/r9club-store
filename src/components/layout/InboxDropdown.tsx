'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  BellIcon, 
  CheckIcon,
  TrashIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  MegaphoneIcon,
  CogIcon,
} from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';
import { useInboxStore, Notification } from '@/stores/useInboxStore';

const notificationIcons: Record<Notification['type'], React.ComponentType<{className?: string}>> = {
  purchase: ShoppingBagIcon,
  topup: CreditCardIcon,
  promo: MegaphoneIcon,
  system: CogIcon,
};

const notificationColors: Record<Notification['type'], string> = {
  purchase: 'bg-green-500/20 text-green-400',
  topup: 'bg-blue-500/20 text-blue-400',
  promo: 'bg-yellow-500/20 text-yellow-400',
  system: 'bg-gray-500/20 text-gray-400',
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'เมื่อกี้';
  if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
  return date.toLocaleDateString('th-TH');
}

export function InboxDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useInboxStore();

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        {unreadCount > 0 ? (
          <BellIconSolid className="w-6 h-6 text-yellow-400" />
        ) : (
          <BellIcon className="w-6 h-6" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="font-semibold flex items-center gap-2">
              <BellIcon className="w-5 h-5" />
              กล่องข้อความ
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs bg-primary-500 rounded-full">
                  {unreadCount} ใหม่
                </span>
              )}
            </h3>
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <CheckIcon className="w-4 h-4" />
                อ่านทั้งหมด
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-12 text-center text-gray-500">
                <BellIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>ไม่มีข้อความใหม่</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((notification) => {
                  const Icon = notificationIcons[notification.type];
                  const colorClass = notificationColors[notification.type];

                  return (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-white/5 transition-colors ${
                        !notification.read ? 'bg-primary-500/5' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className={`font-medium text-sm ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-400 mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                            </div>
                            <button
                              onClick={() => removeNotification(notification.id)}
                              className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-red-400 transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">
                              {formatTimeAgo(notification.createdAt)}
                            </p>
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                              >
                                อ่านแล้ว
                              </button>
                            )}
                          </div>
                          {notification.link && (
                            <Link
                              href={notification.link}
                              onClick={() => {
                                markAsRead(notification.id);
                                setIsOpen(false);
                              }}
                              className="inline-block mt-2 text-xs text-primary-400 hover:underline"
                            >
                              ดูรายละเอียด →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-white/10 text-center">
              <Link
                href="/dashboard/notifications"
                onClick={() => setIsOpen(false)}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                ดูทั้งหมด
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
