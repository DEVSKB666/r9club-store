import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { AddToCartButton } from './AddToCartButton';
import { PlaySampleButton } from './PlaySampleButton';
import { ProductCard } from '@/components/products/ProductCard';

interface ProductDetailPageProps {
  params: { id: string };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = await prisma.product.findUnique({
    where: { id: params.id, isActive: true },
    include: { category: true },
  });

  if (!product) {
    notFound();
  }

  // Get related products
  const relatedProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      id: { not: product.id },
      ...(product.categoryId && { categoryId: product.categoryId }),
    },
    take: 4,
    orderBy: { playCount: 'desc' },
  });

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6">
          <a href="/" className="hover:text-white">หน้าแรก</a>
          <span className="mx-2">/</span>
          <a href="/products" className="hover:text-white">สินค้า</a>
          {product.category && (
            <>
              <span className="mx-2">/</span>
              <a href={`/products?category=${product.category.slug}`} className="hover:text-white">
                {product.category.name}
              </a>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-white">{product.title}</span>
        </nav>

        {/* Product Detail */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Cover Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={product.coverImage}
              alt={product.title}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </div>

          {/* Info */}
          <div className="space-y-6">
            {/* Category Badge */}
            {product.category && (
              <a
                href={`/products?category=${product.category.slug}`}
                className="inline-block px-3 py-1 rounded-full bg-white/10 text-sm hover:bg-white/20 transition-colors"
              >
                {product.category.name}
              </a>
            )}

            {/* Title & Artist */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{product.title}</h1>
              <p className="text-xl text-gray-400 mt-2">{product.artist}</p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-green-400">
                {formatPrice(product.price)}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300">{product.description}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-4 pt-4">
              <PlaySampleButton
                track={{
                  id: product.id,
                  title: product.title,
                  artist: product.artist,
                  coverImage: product.coverImage,
                  sampleAudioUrl: product.sampleAudioUrl,
                }}
              />
              
              <AddToCartButton
                product={{
                  id: product.id,
                  title: product.title,
                  artist: product.artist,
                  price: product.price,
                  coverImage: product.coverImage,
                }}
              />
            </div>

            {/* Info Box */}
            <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
              <h3 className="font-semibold mb-2">รายละเอียด</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• ไฟล์คุณภาพสูง (MP3 320kbps)</li>
                <li>• ดาวน์โหลดได้ทันทีหลังชำระเงิน</li>
                <li>• ลิงก์ดาวน์โหลดใช้ได้ 24 ชั่วโมง</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">เพลงที่คุณอาจชอบ</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={{
                    id: p.id,
                    title: p.title,
                    artist: p.artist,
                    price: p.price,
                    coverImage: p.coverImage,
                    sampleAudioUrl: p.sampleAudioUrl,
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
