import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/products/ProductCard';
import Link from 'next/link';
import Image from 'next/image';
import { MusicalNoteIcon, SparklesIcon, FireIcon } from '@heroicons/react/24/outline';
import { getSettings } from '@/lib/settings';
import { HeroSliderWrapper } from '@/components/home/HeroSliderWrapper';
import { PlansSection } from '@/components/sections/PlansSection';
import { TeamSection } from '@/components/sections/TeamSection';
import { FAQSection } from '@/components/sections/FAQSection';

export default async function HomePage() {
  // Fetch site settings
  const settings = await getSettings(['site_name', 'site_description']);
  // Fetch featured products
  const featuredProducts = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    take: 8,
    orderBy: { createdAt: 'desc' },
  });

  // Fetch latest products
  const latestProducts = await prisma.product.findMany({
    where: { isActive: true },
    take: 8,
    orderBy: { createdAt: 'desc' },
  });

  // Fetch popular products (by play count)
  const popularProducts = await prisma.product.findMany({
    where: { isActive: true },
    take: 8,
    orderBy: { playCount: 'desc' },
  });

  // Fetch categories
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicStore',
    name: settings.site_name || 'R9 Club',
    description: settings.site_description,
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://r9club.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${process.env.NEXT_PUBLIC_APP_URL || 'https://r9club.com'}/products?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Slider */}
      <section className="max-w-7xl mx-auto px-4 pt-6">
        <HeroSliderWrapper />
      </section>

      {/* Category Tags */}
      {categories.length > 0 && (
        <section className="py-8 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="px-6 py-2.5 rounded-full bg-gray-800/80 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 transition-all text-white font-medium shadow-lg"
                >
                  <span>{category.name}</span>
                  <span className="ml-2 text-sm text-gray-400">({category._count.products})</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Icon Cards */}
      {categories.length > 0 && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.slice(0, 4).map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 transition-all duration-300 aspect-[4/3] flex flex-col items-center justify-center p-6 shadow-xl hover:shadow-2xl hover:shadow-red-500/20 hover:scale-105"
                >
                  {/* Icon */}
                  <div className="mb-4">
                    {category.image ? (
                      <div className="relative w-16 h-16 md:w-20 md:h-20">
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          sizes="80px"
                          className="object-contain filter brightness-0 invert"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 flex items-center justify-center">
                        <MusicalNoteIcon className="w-10 h-10 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Name */}
                  <h3 className="text-lg md:text-xl font-bold text-white text-center">
                    {category.name}
                  </h3>
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-20 relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm mb-3">
                  <SparklesIcon className="w-4 h-4" />
                  <span>แนะนำสำหรับคุณ</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">
                  สินค้า<span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">แนะนำ</span>
                </h2>
              </div>
              <Link 
                href="/products?featured=true" 
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-yellow-500/30 transition-all"
              >
                <span className="text-gray-300 group-hover:text-yellow-400 transition-colors">ดูทั้งหมด</span>
                <span className="text-yellow-400 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
            
            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product) => (
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
          </div>
        </section>
      )}

      {/* Popular Products */}
      {popularProducts.length > 0 && (
        <section className="py-20 relative overflow-hidden bg-gradient-to-b from-orange-500/5 to-transparent">
          {/* Background Decoration */}
          <div className="absolute top-1/2 left-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm mb-3">
                  <FireIcon className="w-4 h-4" />
                  <span>กำลังฮิต</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">
                  สินค้า<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">ยอดนิยม</span> 🔥
                </h2>
              </div>
              <Link 
                href="/products?sort=popular" 
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-orange-500/30 transition-all"
              >
                <span className="text-gray-300 group-hover:text-orange-400 transition-colors">ดูทั้งหมด</span>
                <span className="text-orange-400 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
            
            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {popularProducts.map((product) => (
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
          </div>
        </section>
      )}

      {/* Latest Products */}
      {latestProducts.length > 0 && (
        <section className="py-20 relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm mb-3">
                  <MusicalNoteIcon className="w-4 h-4" />
                  <span>อัพเดทล่าสุด</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">
                  สินค้า<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">ใหม่ล่าสุด</span> ✨
                </h2>
              </div>
              <Link 
                href="/products" 
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary-500/30 transition-all"
              >
                <span className="text-gray-300 group-hover:text-primary-400 transition-colors">ดูทั้งหมด</span>
                <span className="text-primary-400 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
            
            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {latestProducts.map((product) => (
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
          </div>
        </section>
      )}

      {/* Plans Section */}
      <PlansSection />

      {/* Team Section */}
      <TeamSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Empty State */}
      {featuredProducts.length === 0 && latestProducts.length === 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <MusicalNoteIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-400 mb-2">ยังไม่มีสินค้า</h2>
            <p className="text-gray-500">กรุณารอสักครู่ เรากำลังเพิ่มเพลงใหม่ๆ เข้ามา</p>
          </div>
        </section>
      )}
    </div>
  );
}
