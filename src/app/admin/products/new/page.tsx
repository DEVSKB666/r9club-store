import { prisma } from '@/lib/prisma';
import { ProductForm } from './ProductForm';

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">เพิ่มสินค้าใหม่</h1>
        <p className="text-gray-400">กรอกข้อมูลเพลงที่ต้องการเพิ่ม</p>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
