import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/products/ProductCard';
import Link from 'next/link';
import { MagnifyingGlassIcon, MusicalNoteIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface SearchPageProps {
  searchParams: { q?: string };
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  return {
    title: searchParams.q ? `ค้นหา "${searchParams.q}" | R9Club` : 'ค้นหา | R9Club',
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = searchParams;

  let products: any[] = [];

  if (q && q.trim()) {
    products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: q } },
          { artist: { contains: q } },
          { description: { contains: q } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden bg-gradient-to-br from-purple-900/50 via-gray-900 to-gray-900">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        
        <div className="relative max-w-7xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">หน้าแรก</Link>
            <ChevronRightIcon className="w-4 h-4" />
            <span className="text-white">ค้นหา</span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <MagnifyingGlassIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {q ? `ผลการค้นหา "${q}"` : 'ค้นหาสินค้า'}
              </h1>
              <p className="text-gray-400 mt-1">
                {q ? `${products.length} รายการ` : 'พิมพ์คำค้นหาในช่องด้านบน'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          {q ? (
            products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      id: product.id,
                      title: product.title,
                      artist: product.artist,
                      price: product.price,
                      coverImage: product.coverImage,
                      previewUrl: product.previewUrl,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 rounded-2xl bg-gray-900/30 border border-white/5">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                  <MagnifyingGlassIcon className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  ไม่พบสินค้าที่ตรงกับ &quot;{q}&quot;
                </h3>
                <p className="text-gray-500 mb-6">ลองใช้คำค้นหาอื่น หรือดูสินค้าทั้งหมด</p>
                <Link
                  href="/products"
                  className="inline-flex px-6 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors"
                >
                  ดูสินค้าทั้งหมด
                </Link>
              </div>
            )
          ) : (
            <div className="text-center py-20 rounded-2xl bg-gray-900/30 border border-white/5">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                <MagnifyingGlassIcon className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                เริ่มค้นหา
              </h3>
              <p className="text-gray-500">พิมพ์ชื่อเพลง ศิลปิน หรือคำอธิบาย</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
