'use client';

import { useRouter } from 'next/navigation';
import { TrashIcon } from '@heroicons/react/24/outline';
import swal from '@/lib/swal';

interface ProductDeleteButtonProps {
  productId: string;
  productTitle: string;
}

export function ProductDeleteButton({ productId, productTitle }: ProductDeleteButtonProps) {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = await swal.confirmDelete(productTitle);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'ลบไม่สำเร็จ');
      }

      swal.success('ลบสินค้าสำเร็จ!');
      router.refresh();
    } catch (error: Error | unknown) {
      const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
      swal.error(message);
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"
      title="ลบ"
    >
      <TrashIcon className="w-5 h-5" />
    </button>
  );
}
