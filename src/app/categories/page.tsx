import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Metadata } from 'next';
import { 
  SparklesIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'หมวดหมู่สินค้า | R9Club',
  description: 'เลือกดูสินค้าตามหมวดหมู่ที่คุณสนใจ',
};

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { products: true } },
      products: {
        where: { isActive: true },
        take: 4,
        orderBy: { createdAt: 'desc' },
        select: { coverImage: true },
      },
    },
  });

  // Get stats
  const totalProducts = await prisma.product.count({ where: { isActive: true } });

  // Gradient colors for category cards
  const gradients = [
    'from-rose-500 to-pink-600',
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-red-500 to-rose-600',
    'from-indigo-500 to-blue-600',
    'from-fuchsia-500 to-pink-600',
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-red-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
            <SparklesIcon className="w-4 h-4 text-red-400" />
            <span className="text-sm text-gray-300">เลือกซื้อตามหมวดหมู่</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              หมวดหมู่สินค้า
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            ค้นหาสินค้าที่คุณต้องการได้ง่ายขึ้นด้วยการเลือกดูตามหมวดหมู่
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{categories.length}</div>
              <div className="text-sm text-gray-500">หมวดหมู่</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{totalProducts}</div>
              <div className="text-sm text-gray-500">สินค้าทั้งหมด</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group relative overflow-hidden rounded-3xl bg-gray-900/50 border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/10"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index % gradients.length]} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                {/* Product Preview Grid */}
                <div className="relative h-40 bg-gray-800/50 overflow-hidden">
                  {category.products.length > 0 ? (
                    <div className="absolute inset-0 grid grid-cols-2 gap-0.5 p-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      {category.products.slice(0, 4).map((product, i) => (
                        <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
                          {product.coverImage ? (
                            <img
                              src={product.coverImage}
                              alt=""
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-700" />
                          )}
                        </div>
                      ))}
                      {/* Fill empty slots */}
                      {[...Array(4 - category.products.length)].map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square bg-gray-700/50 rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradients[index % gradients.length]} opacity-20 flex items-center justify-center`}>
                        {category.image ? (
                          <img src={category.image} alt="" className="w-12 h-12 object-contain filter brightness-0 invert opacity-50" />
                        ) : (
                          <SparklesIcon className="w-8 h-8 text-white/50" />
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                  
                  {/* Category Icon */}
                  <div className="absolute bottom-3 left-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[index % gradients.length]} shadow-lg flex items-center justify-center`}>
                      {category.image ? (
                        <img src={category.image} alt="" className="w-7 h-7 object-contain filter brightness-0 invert" />
                      ) : (
                        <SparklesIcon className="w-6 h-6 text-white" />
                      )}
                    </div>
                  </div>
                  
                  {/* Product Count Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm text-xs text-white font-medium">
                      {category._count.products} สินค้า
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="relative p-5">
                  <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-red-400 transition-colors">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                      {category.description}
                    </p>
                  )}
                  
                  {/* View Button */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 group-hover:text-red-400 transition-colors">
                    <span>ดูสินค้าทั้งหมด</span>
                    <ArrowRightIcon className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${gradients[index % gradients.length]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </Link>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-800 flex items-center justify-center">
                <SparklesIcon className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                ยังไม่มีหมวดหมู่
              </h3>
              <p className="text-gray-500 mb-6">กรุณากลับมาใหม่ภายหลัง</p>
              <Link
                href="/products"
                className="inline-flex px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
              >
                ดูสินค้าทั้งหมด
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
