import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ProductForm } from '../new/ProductForm';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface EditProductPageProps {
  params: { id: string };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
    }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">แก้ไขสินค้า</h1>
          <p className="text-gray-400">{product.title}</p>
        </div>
      </div>

      {/* Form */}
      <ProductForm 
        categories={categories} 
        product={{
          id: product.id,
          title: product.title,
          artist: product.artist,
          description: product.description,
          price: product.price,
          coverImage: product.coverImage,
          sampleAudioUrl: product.sampleAudioUrl,
          fullAudioUrl: product.fullAudioUrl,
          categoryId: product.categoryId,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
        }} 
      />
    </div>
  );
}
