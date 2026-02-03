import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/products/ProductCard';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  ChevronRightIcon, 
  SparklesIcon,
  ArrowLeftIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';

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

  // Gradient colors for category icons
  const gradients = [
    'from-rose-500 to-pink-600',
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-red-500 to-rose-600',
  ];

  const currentIndex = allCategories.findIndex(c => c.slug === params.slug);
  const currentGradient = gradients[currentIndex % gradients.length];

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative py-20 overflow-hidden">
        {/* Animated Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${currentGradient} opacity-90`} />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
        
        {/* Floating Orbs */}
        <div className="absolute top-10 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute bottom-10 left-1/4 w-48 h-48 bg-white/5 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '0.5s' }} />
        
        <div className="relative max-w-7xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/70 mb-8">
            <Link href="/" className="hover:text-white transition-colors">หน้าแรก</Link>
            <ChevronRightIcon className="w-4 h-4" />
            <Link href="/categories" className="hover:text-white transition-colors">หมวดหมู่</Link>
            <ChevronRightIcon className="w-4 h-4" />
            <span className="text-white font-medium">{category.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Category Icon */}
            <div className="w-28 h-28 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30 shadow-2xl">
              {category.image ? (
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-16 h-16 object-contain filter brightness-0 invert"
                />
              ) : (
                <SparklesIcon className="w-12 h-12 text-white" />
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 drop-shadow-lg">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-lg md:text-xl text-white/80 mb-4 max-w-2xl">{category.description}</p>
              )}
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/20">
                  <span className="text-white font-medium">{category.products.length} สินค้า</span>
                </div>
                <Link 
                  href="/categories"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 text-white/80 hover:text-white hover:bg-black/30 transition-all"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  <span>ดูหมวดหมู่ทั้งหมด</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Categories */}
            <aside className="lg:w-72 flex-shrink-0">
              <div className="sticky top-24 space-y-4">
                {/* Categories List */}
                <div className="rounded-3xl bg-gray-900/50 backdrop-blur-xl border border-white/10 p-5 shadow-xl">
                  <div className="flex items-center gap-2 mb-5">
                    <Squares2X2Icon className="w-5 h-5 text-red-400" />
                    <h3 className="font-semibold text-white">หมวดหมู่ทั้งหมด</h3>
                  </div>
                  <nav className="space-y-1">
                    {allCategories.map((cat, index) => {
                      const isActive = cat.slug === params.slug;
                      const catGradient = gradients[index % gradients.length];
                      return (
                        <Link
                          key={cat.id}
                          href={`/categories/${cat.slug}`}
                          className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
                            isActive
                              ? `bg-gradient-to-r ${catGradient} text-white shadow-lg`
                              : 'text-gray-400 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          {/* Small Icon */}
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            isActive 
                              ? 'bg-white/20' 
                              : `bg-gradient-to-br ${catGradient} opacity-20 group-hover:opacity-40`
                          }`}>
                            {cat.image ? (
                              <img 
                                src={cat.image} 
                                alt="" 
                                className={`w-4 h-4 object-contain ${isActive ? 'filter brightness-0 invert' : 'opacity-60'}`}
                              />
                            ) : (
                              <SparklesIcon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                            )}
                          </div>
                          <span className="flex-1 font-medium">{cat.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            isActive 
                              ? 'bg-white/20 text-white' 
                              : 'bg-gray-800 text-gray-500'
                          }`}>
                            {cat._count.products}
                          </span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <p className="text-gray-400">
                  พบ <span className="text-white font-semibold">{category.products.length}</span> สินค้า
                </p>
              </div>

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
                        sampleAudioUrl: product.sampleAudioUrl,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-24">
                  <div className={`w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${currentGradient} opacity-20 flex items-center justify-center`}>
                    <SparklesIcon className="w-12 h-12 text-white/50" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-400 mb-3">
                    ยังไม่มีสินค้าในหมวดหมู่นี้
                  </h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    เรากำลังเพิ่มสินค้าใหม่อยู่เรื่อยๆ กรุณากลับมาใหม่ภายหลัง หรือเลือกดูหมวดหมู่อื่น
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <Link
                      href="/products"
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r ${currentGradient} text-white font-medium transition-all hover:shadow-lg hover:shadow-red-500/20 hover:scale-105`}
                    >
                      ดูสินค้าทั้งหมด
                    </Link>
                    <Link
                      href="/categories"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium transition-all border border-white/10"
                    >
                      <ArrowLeftIcon className="w-4 h-4" />
                      กลับหน้าหมวดหมู่
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
