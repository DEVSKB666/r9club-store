import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Seeding database...');

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@r9clubradio.com' },
    update: {},
    create: {
      email: 'admin@r9clubradio.com',
      name: 'Admin',
      password: adminPassword,
      role: 'ADMIN',
      creditBalance: 10000,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create Test User
  const userPassword = await bcrypt.hash('user123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: userPassword,
      role: 'USER',
      creditBalance: 500,
    },
  });
  console.log('✅ Test user created:', user.email);

  // Create Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'pop' },
      update: {},
      create: { name: 'Pop', slug: 'pop', description: 'Popular music' },
    }),
    prisma.category.upsert({
      where: { slug: 'rock' },
      update: {},
      create: { name: 'Rock', slug: 'rock', description: 'Rock music' },
    }),
    prisma.category.upsert({
      where: { slug: 'jazz' },
      update: {},
      create: { name: 'Jazz', slug: 'jazz', description: 'Jazz music' },
    }),
    prisma.category.upsert({
      where: { slug: 'electronic' },
      update: {},
      create: { name: 'Electronic', slug: 'electronic', description: 'Electronic music' },
    }),
    prisma.category.upsert({
      where: { slug: 'thai' },
      update: {},
      create: { name: 'Thai', slug: 'thai', description: 'Thai music' },
    }),
  ]);
  console.log('✅ Categories created:', categories.length);

  // Create Sample Products
  const sampleProducts = [
    {
      title: 'Summer Vibes',
      artist: 'R9Club DJ',
      description: 'เพลงบรรยากาศฤดูร้อนสดใส เหมาะสำหรับปาร์ตี้ริมสระ',
      price: 29,
      coverImage: 'https://picsum.photos/seed/summer/500/500',
      sampleAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      fullAudioUrl: '/uploads/full/summer-vibes.mp3',
      categoryId: categories[0].id,
      isFeatured: true,
      playCount: 150,
    },
    {
      title: 'Night Drive',
      artist: 'Midnight Crew',
      description: 'เพลงบรรยากาศยามค่ำคืน เหมาะสำหรับขับรถเล่น',
      price: 39,
      coverImage: 'https://picsum.photos/seed/night/500/500',
      sampleAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      fullAudioUrl: '/uploads/full/night-drive.mp3',
      categoryId: categories[3].id,
      isFeatured: true,
      playCount: 200,
    },
    {
      title: 'Thai Chill',
      artist: 'ลุงสมชาย',
      description: 'เพลงไทยชิลๆ ฟังสบายๆ',
      price: 19,
      coverImage: 'https://picsum.photos/seed/thai/500/500',
      sampleAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      fullAudioUrl: '/uploads/full/thai-chill.mp3',
      categoryId: categories[4].id,
      isFeatured: true,
      playCount: 100,
    },
    {
      title: 'Jazz Cafe',
      artist: 'The Jazz Masters',
      description: 'เพลงแจ๊สบรรยากาศร้านกาแฟ',
      price: 49,
      coverImage: 'https://picsum.photos/seed/jazz/500/500',
      sampleAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      fullAudioUrl: '/uploads/full/jazz-cafe.mp3',
      categoryId: categories[2].id,
      isFeatured: false,
      playCount: 80,
    },
    {
      title: 'Rock Anthem',
      artist: 'Thunder Band',
      description: 'เพลงร็อคกระหึ่ม',
      price: 35,
      coverImage: 'https://picsum.photos/seed/rock/500/500',
      sampleAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
      fullAudioUrl: '/uploads/full/rock-anthem.mp3',
      categoryId: categories[1].id,
      isFeatured: false,
      playCount: 120,
    },
    {
      title: 'Morning Coffee',
      artist: 'Acoustic Dreams',
      description: 'เพลงอะคูสติกเบาๆ สำหรับเช้าวันใหม่',
      price: 25,
      coverImage: 'https://picsum.photos/seed/morning/500/500',
      sampleAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
      fullAudioUrl: '/uploads/full/morning-coffee.mp3',
      categoryId: categories[0].id,
      isFeatured: true,
      playCount: 90,
    },
  ];

  for (const productData of sampleProducts) {
    await prisma.product.create({ data: productData });
  }
  console.log('✅ Sample products created:', sampleProducts.length);

  console.log('🎉 Seeding completed!');
  console.log('\n📋 Login credentials:');
  console.log('   Admin: admin@r9clubradio.com / admin123');
  console.log('   User:  test@example.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
