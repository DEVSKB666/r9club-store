import { prisma } from '@/lib/prisma';
import { CategoriesManager } from './CategoriesManager';

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">จัดการหมวดหมู่</h1>
        <p className="text-gray-400">หมวดหมู่ทั้งหมด {categories.length} รายการ</p>
      </div>

      <CategoriesManager initialCategories={categories} />
    </div>
  );
}
