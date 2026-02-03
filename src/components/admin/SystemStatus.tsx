'use client';

import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ServerIcon,
  CircleStackIcon,
  PhotoIcon,
  CloudIcon,
} from '@heroicons/react/24/outline';

interface StatusItem {
  name: string;
  status: 'online' | 'offline' | 'warning';
  detail?: string;
}

interface SystemStatusProps {
  items: StatusItem[];
  mediaCount: number;
  mediaSize: string;
}

const statusIcons = {
  'Database': CircleStackIcon,
  'API': CloudIcon,
  'Media Storage': PhotoIcon,
  'Server': ServerIcon,
};

const statusColors = {
  online: 'text-green-400',
  offline: 'text-red-400',
  warning: 'text-yellow-400',
};

const statusBgColors = {
  online: 'bg-green-500/20',
  offline: 'bg-red-500/20',
  warning: 'bg-yellow-500/20',
};

export default function SystemStatus({ items, mediaCount, mediaSize }: SystemStatusProps) {
  return (
    <div className="space-y-4">
      {/* Status Grid */}
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => {
          const Icon = statusIcons[item.name as keyof typeof statusIcons] || ServerIcon;
          const colorClass = statusColors[item.status];
          const bgColorClass = statusBgColors[item.status];
          
          return (
            <div
              key={item.name}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bgColorClass}`}>
                <Icon className={`w-4 h-4 ${colorClass}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <div className="flex items-center gap-1">
                  {item.status === 'online' ? (
                    <CheckCircleIcon className="w-3 h-3 text-green-400" />
                  ) : (
                    <ExclamationCircleIcon className={`w-3 h-3 ${colorClass}`} />
                  )}
                  <span className={`text-xs ${colorClass}`}>
                    {item.status === 'online' ? 'ปกติ' : item.status === 'warning' ? 'ระวัง' : 'ออฟไลน์'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Media Stats */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <PhotoIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Media Files</p>
              <p className="text-lg font-semibold">{mediaCount.toLocaleString()} ไฟล์</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Storage</p>
            <p className="text-lg font-semibold text-indigo-400">{mediaSize}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
