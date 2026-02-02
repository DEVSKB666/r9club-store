import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { PlusIcon, PencilIcon, EyeIcon } from '@heroicons/react/24/outline';
import { ProductDeleteButton } from './ProductDeleteButton';

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">จัดการสินค้า</h1>
          <p className="text-gray-400">รายการเพลงทั้งหมด {products.length} รายการ</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          เพิ่มสินค้า
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-gray-900/50 border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">สินค้า</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">หมวดหมู่</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">ราคา</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">สถานะ</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Plays</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.coverImage}
                        alt={product.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium">{product.title}</p>
                        <p className="text-sm text-gray-400">{product.artist}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {product.category ? (
                      <span className="px-2 py-1 rounded-full bg-white/10 text-sm">
                        {product.category.name}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-green-400 font-semibold">
                      {formatPrice(product.price)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${product.isActive ? 'bg-green-400' : 'bg-gray-500'}`} />
                      <span className={product.isActive ? 'text-green-400' : 'text-gray-500'}>
                        {product.isActive ? 'เปิดขาย' : 'ปิดขาย'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {product.playCount}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/products/${product.id}`}
                        target="_blank"
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        title="ดูหน้าร้าน"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </Link>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-colors"
                        title="แก้ไข"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </Link>
                      <ProductDeleteButton
                        productId={product.id}
                        productTitle={product.title}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">ยังไม่มีสินค้า</p>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 mt-4 text-primary-400 hover:underline"
            >
              <PlusIcon className="w-5 h-5" />
              เพิ่มสินค้าตอนนี้
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
