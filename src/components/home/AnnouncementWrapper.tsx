import { prisma } from '@/lib/prisma';
import { AnnouncementBar } from '@/components/home/AnnouncementBar';

export async function AnnouncementWrapper() {
  let announcements: { id: string; message: string; type: string; linkUrl: string | null }[] = [];
  
  try {
    const now = new Date();
    announcements = await prisma.announcement.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: now }, endDate: null },
          { startDate: null, endDate: { gte: now } },
          { startDate: { lte: now }, endDate: { gte: now } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        message: true,
        type: true,
        linkUrl: true,
      },
    });
  } catch (error) {
    // Table might not exist yet
    console.error('Error fetching announcements:', error);
  }

  if (announcements.length === 0) {
    return null;
  }

  return (
    <AnnouncementBar 
      announcements={announcements.map(a => ({
        ...a,
        linkUrl: a.linkUrl || undefined,
      }))} 
    />
  );
}
