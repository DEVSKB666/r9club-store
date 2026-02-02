'use client';

import { TrashIcon } from '@heroicons/react/24/outline';
import { deleteOrder } from './actions';
import { swal } from '@/lib/swal';
import { useState } from 'react';

export default function OrderActions({ orderId }: { orderId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const result = await swal.confirm(
      'คุณแน่ใจหรือไม่?',
      'คำสั่งซื้อนี้จะถูกลบถาวร และไม่สามารถกู้คืนได้'
    );
    
    if (result) {
      setIsDeleting(true);
      try {
        const res = await deleteOrder(orderId);
        if (res.success) {
          swal.success('ลบคำสั่งซื้อเรียบร้อยแล้ว');
        } else {
          swal.error('ไม่สามารถลบคำสั่งซื้อได้');
        }
      } catch (error) {
        swal.error('เกิดข้อผิดพลาด');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
      title="ลบคำสั่งซื้อ"
    >
      <TrashIcon className="w-5 h-5" />
    </button>
  );
}
