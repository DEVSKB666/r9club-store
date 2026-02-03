'use client';

import {
  ShoppingBagIcon,
  UserPlusIcon,
  CurrencyDollarIcon,
  MusicalNoteIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

export interface ActivityItem {
  id: string;
  type: 'order' | 'signup' | 'topup' | 'product' | 'topup_approved' | 'topup_rejected';
  message: string;
  timestamp: Date;
  amount?: number;
  userName?: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const activityIcons = {
  order: ShoppingBagIcon,
  signup: UserPlusIcon,
  topup: CurrencyDollarIcon,
  product: MusicalNoteIcon,
  topup_approved: CheckCircleIcon,
  topup_rejected: XCircleIcon,
};

const activityColors = {
  order: 'text-blue-400 bg-blue-500/20',
  signup: 'text-purple-400 bg-purple-500/20',
  topup: 'text-yellow-400 bg-yellow-500/20',
  product: 'text-pink-400 bg-pink-500/20',
  topup_approved: 'text-green-400 bg-green-500/20',
  topup_rejected: 'text-red-400 bg-red-500/20',
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'เมื่อสักครู่';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} นาทีที่แล้ว`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ชั่วโมงที่แล้ว`;
  return `${Math.floor(diffInSeconds / 86400)} วันที่แล้ว`;
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        ยังไม่มีกิจกรรม
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
      {activities.map((activity) => {
        const Icon = activityIcons[activity.type];
        const colorClass = activityColors[activity.type];
        
        return (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-200 line-clamp-2">{activity.message}</p>
              <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.timestamp)}</p>
            </div>
            {activity.amount && (
              <span className="text-sm font-medium text-green-400 flex-shrink-0">
                ฿{activity.amount.toLocaleString()}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
