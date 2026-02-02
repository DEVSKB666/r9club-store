'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import swal from '@/lib/swal';

interface TransactionActionsProps {
  transactionId: string;
}

export function TransactionActions({ transactionId }: TransactionActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: 'approve' | 'reject') => {
    const confirmed = await swal.confirm(
      action === 'approve' ? 'ยืนยันการอนุมัติ?' : 'ยืนยันการปฏิเสธ?',
      action === 'approve' 
        ? 'เครดิตจะถูกเพิ่มให้ผู้ใช้ทันที' 
        : 'ผู้ใช้จะได้รับแจ้งเตือนว่าถูกปฏิเสธ'
    );

    if (!confirmed) return;

    setIsLoading(true);

    try {
      const res = await fetch(`/api/admin/transactions/${transactionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        throw new Error('Failed to process');
      }

      swal.success(action === 'approve' ? 'อนุมัติสำเร็จ!' : 'ปฏิเสธแล้ว');
      router.refresh();
    } catch (error) {
      swal.error('เกิดข้อผิดพลาด');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => handleAction('approve')}
        disabled={isLoading}
        className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50"
        title="อนุมัติ"
      >
        <CheckIcon className="w-5 h-5" />
      </button>
      <button
        onClick={() => handleAction('reject')}
        disabled={isLoading}
        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
        title="ปฏิเสธ"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
  );
}

