import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/products/ProductCard';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRightIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';

interface CategoryPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
  });

  if (!category) return { title: 'ไม่พบหมวดหมู่' };

  return {
    title: `${category.name} | R9Club`,
    description: category.description || `สินค้าในหมวดหมู่ ${category.name}`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!category) {
    notFound();
  }

  // Get all categories for sidebar
  const allCategories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative py-16 overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-red-800">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/70 mb-6">
            <Link href="/" className="hover:text-white">หน้าแรก</Link>
            <ChevronRightIcon className="w-4 h-4" />
            <Link href="/products" className="hover:text-white">สินค้า</Link>
            <ChevronRightIcon className="w-4 h-4" />
            <span className="text-white">{category.name}</span>
          </nav>

          <div className="flex items-center gap-6">
            {/* Category Icon */}
            <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              {category.image ? (
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-16 h-16 object-contain filter brightness-0 invert"
                />
              ) : (
                <MusicalNoteIcon className="w-12 h-12 text-white" />
              )}
            </div>

            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-lg text-white/80">{category.description}</p>
              )}
              <p className="text-white/60 mt-2">
                {category.products.length} รายการ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Categories */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="sticky top-24 rounded-2xl bg-gray-900/50 border border-white/10 p-4">
                <h3 className="font-semibold mb-4 text-gray-400 text-sm uppercase tracking-wider">
                  หมวดหมู่ทั้งหมด
                </h3>
                <nav className="space-y-1">
                  {allCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.slug}`}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                        cat.slug === params.slug
                          ? 'bg-red-600 text-white'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className={`text-xs ${cat.slug === params.slug ? 'text-white/80' : 'text-gray-600'}`}>
                        {cat._count.products}
                      </span>
                    </Link>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {category.products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {category.products.map((product) => (
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
                <div className="text-center py-20">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                    <MusicalNoteIcon className="w-10 h-10 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">
                    ยังไม่มีสินค้าในหมวดหมู่นี้
                  </h3>
                  <p className="text-gray-500 mb-6">กรุณากลับมาใหม่ภายหลัง</p>
                  <Link
                    href="/products"
                    className="inline-flex px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                  >
                    ดูสินค้าทั้งหมด
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
