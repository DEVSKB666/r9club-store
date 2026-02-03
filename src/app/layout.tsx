import type { Metadata } from 'next';
import { Prompt } from 'next/font/google';
import './globals.css';
import { HeaderWrapper } from '@/components/layout/HeaderWrapper';
import Footer from '@/components/layout/Footer';
import { AudioPlayer } from '@/components/player/AudioPlayer';
import { AnnouncementWrapper } from '@/components/home/AnnouncementWrapper';
import { Providers } from './providers';
import { getSeoSettings, getSetting } from '@/lib/settings';

const prompt = Prompt({ 
  subsets: ['latin', 'thai'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-prompt',
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const seo = await getSeoSettings();
    const favicon = await getSetting('site_favicon');
    return {
      metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://r9club.com'),
      title: seo.meta_title || seo.site_name || undefined,
      description: seo.meta_description || undefined,
      keywords: seo.meta_keywords?.split(',').map((k: string) => k.trim()) || undefined,
      icons: {
        icon: favicon || '/favicon.ico',
      },
      openGraph: {
        title: seo.meta_title || seo.site_name || undefined,
        description: seo.meta_description || undefined,
        images: seo.og_image ? [seo.og_image] : [],
        siteName: seo.site_name || undefined,
      },
    };
  } catch {
    return {};
  }
}

import { ChatWidget } from '@/components/chat/ChatWidget';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="dark">
      <body className={`${prompt.variable} font-sans antialiased bg-gray-950 text-white min-h-screen`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <AnnouncementWrapper />
            <HeaderWrapper />
            <main className="flex-1 pb-player">{children}</main>
            <Footer />
            <AudioPlayer />
            <ChatWidget />
          </div>
        </Providers>
      </body>
    </html>
  );
}
