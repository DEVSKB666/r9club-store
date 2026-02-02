'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { XMarkIcon, MegaphoneIcon } from '@heroicons/react/24/outline';

interface Announcement {
  id: string;
  message: string;
  type: string;
  linkUrl?: string;
}

interface AnnouncementBarProps {
  announcements?: Announcement[];
}

const typeStyles: Record<string, string> = {
  info: 'bg-blue-600',
  warning: 'bg-yellow-600',
  success: 'bg-green-600',
  error: 'bg-red-600',
};

export function AnnouncementBar({ announcements = [] }: AnnouncementBarProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [dismissed, setDismissed] = useState<string[]>([]);

  // Filter out dismissed announcements
  const activeAnnouncements = announcements.filter(
    (a) => !dismissed.includes(a.id)
  );

  useEffect(() => {
    if (activeAnnouncements.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeAnnouncements.length]);

  const handleDismiss = (id: string) => {
    setDismissed((prev) => [...prev, id]);
    // Save to session storage
    sessionStorage.setItem('dismissedAnnouncements', JSON.stringify([...dismissed, id]));
  };

  useEffect(() => {
    // Load dismissed from session storage
    const saved = sessionStorage.getItem('dismissedAnnouncements');
    if (saved) {
      try {
        setDismissed(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  if (!isVisible || activeAnnouncements.length === 0) {
    return null;
  }

  const current = activeAnnouncements[currentIndex % activeAnnouncements.length];
  if (!current) return null;

  const bgClass = typeStyles[current.type] || typeStyles.info;

  return (
    <div className={`${bgClass} text-white py-2 px-4 relative`}>
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <MegaphoneIcon className="w-5 h-5 flex-shrink-0" />
        
        {current.linkUrl ? (
          <Link href={current.linkUrl} className="hover:underline text-center">
            {current.message}
          </Link>
        ) : (
          <span className="text-center">{current.message}</span>
        )}

        <button
          onClick={() => handleDismiss(current.id)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/20 transition-colors"
          aria-label="ปิดประกาศ"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
