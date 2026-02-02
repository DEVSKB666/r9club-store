import { prisma } from '@/lib/prisma';
import { HeroSlider } from '@/components/home/HeroSlider';

export async function HeroSliderWrapper() {
  let slides: { 
    id: string; 
    title: string | null; 
    description: string | null; 
    imageUrl: string; 
    linkUrl: string | null; 
    buttonText: string | null;
  }[] = [];
  
  try {
    slides = await prisma.slide.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        linkUrl: true,
        buttonText: true,
      },
    });
  } catch (error) {
    // Table might not exist yet
    console.error('Error fetching slides:', error);
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <HeroSlider 
      slides={slides.map(s => ({
        ...s,
        title: s.title || undefined,
        description: s.description || undefined,
        linkUrl: s.linkUrl || undefined,
        buttonText: s.buttonText || undefined,
      }))} 
    />
  );
}
