import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/products/ProductCard';
import Link from 'next/link';
import { MusicalNoteIcon, SparklesIcon, FireIcon, ChevronRightIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface ProductsPageProps {
  searchParams: { featured?: string; category?: string; sort?: string; q?: string };
}

export const metadata = {
  title: 'สินค้าทั้งหมด | R9Club',
  description: 'ค้นหาเพลงและดนตรีที่คุณชื่นชอบ',
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { featured, category, sort, q } = searchParams;

  // Build where clause
  const where: any = { isActive: true };
  
  if (featured === 'true') {
    where.isFeatured = true;
  }
  
  if (category) {
    where.category = { slug: category };
  }
  
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { artist: { contains: q } },
    ];
  }

  // Build orderBy
  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'popular') {
    orderBy = { playCount: 'desc' };
  } else if (sort === 'price-low') {
    orderBy = { price: 'asc' };
  } else if (sort === 'price-high') {
    orderBy = { price: 'desc' };
  }

  const products = await prisma.product.findMany({
    where,
    orderBy,
    include: {
      category: true,
    },
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { products: true } },
    },
  });

  const pageTitle = featured === 'true' ? 'เพลงแนะนำ' : 'สินค้าทั้งหมด';
  const pageIcon = featured === 'true' ? SparklesIcon : MusicalNoteIcon;
  const Icon = pageIcon;

  // Get current category name
  const currentCategory = category ? categories.find(c => c.slug === category) : null;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        
        <div className="relative max-w-7xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">หน้าแรก</Link>
            <ChevronRightIcon className="w-4 h-4" />
            <span className="text-white">{pageTitle}</span>
            {currentCategory && (
              <>
                <ChevronRightIcon className="w-4 h-4" />
                <span className="text-primary-400">{currentCategory.name}</span>
              </>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">{pageTitle}</h1>
              <p className="text-gray-400 mt-1">
                {q ? `ผลการค้นหา "${q}" - ` : ''}
                {products.length} รายการ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              {/* Categories */}
              <div className="rounded-2xl bg-gray-900/50 border border-white/10 p-4 mb-4">
                <h3 className="font-semibold mb-4 text-gray-400 text-sm uppercase tracking-wider flex items-center gap-2">
                  <FunnelIcon className="w-4 h-4" />
                  หมวดหมู่
                </h3>
                <nav className="space-y-1">
                  <Link
                    href="/products"
                    className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                      !category && !featured
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>ทั้งหมด</span>
                  </Link>
                  <Link
                    href="/products?featured=true"
                    className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                      featured === 'true'
                        ? 'bg-yellow-600 text-white'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <SparklesIcon className="w-4 h-4" />
                      แนะนำ
                    </span>
                  </Link>
                  <div className="border-t border-white/10 my-2" />
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.slug}`}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                        category === cat.slug
                          ? 'bg-red-600 text-white'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        category === cat.slug ? 'bg-white/20' : 'bg-white/5'
                      }`}>
                        {cat._count.products}
                      </span>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Sort Options */}
              <div className="rounded-2xl bg-gray-900/50 border border-white/10 p-4">
                <h3 className="font-semibold mb-4 text-gray-400 text-sm uppercase tracking-wider">
                  เรียงตาม
                </h3>
                <nav className="space-y-1">
                  {[
                    { value: '', label: 'ล่าสุด', icon: null },
                    { value: 'popular', label: 'ยอดนิยม', icon: FireIcon },
                    { value: 'price-low', label: 'ราคา: ต่ำ → สูง', icon: null },
                    { value: 'price-high', label: 'ราคา: สูง → ต่ำ', icon: null },
                  ].map((option) => {
                    const baseUrl = new URL('http://localhost/products');
                    if (category) baseUrl.searchParams.set('category', category);
                    if (featured) baseUrl.searchParams.set('featured', featured);
                    if (option.value) baseUrl.searchParams.set('sort', option.value);
                    
                    return (
                      <Link
                        key={option.value}
                        href={baseUrl.pathname + baseUrl.search}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                          (sort || '') === option.value
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {option.icon && <option.icon className="w-4 h-4" />}
                        <span>{option.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={{
                        id: product.id,
                        title: product.title,
                        artist: product.artist,
                        price: product.price,
                        coverImage: product.coverImage,
                        sampleAudioUrl: product.sampleAudioUrl,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 rounded-2xl bg-gray-900/30 border border-white/5">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                    <MusicalNoteIcon className="w-10 h-10 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">
                    ไม่พบสินค้า
                  </h3>
                  <p className="text-gray-500 mb-6">ลองเปลี่ยนตัวกรองหรือค้นหาใหม่</p>
                  <Link
                    href="/products"
                    className="inline-flex px-6 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors"
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
