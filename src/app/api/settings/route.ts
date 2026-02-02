import { NextResponse } from 'next/server';
import { getSiteSettings, clearSettingsCache } from '@/lib/settings';

// Disable caching for this route
export const dynamic = 'force-dynamic';

// GET - Fetch public settings (no auth required)
export async function GET() {
  // Clear cache to get fresh settings
  clearSettingsCache();
  try {
    const allSettings = await getSiteSettings();
    
    // Return only public settings (exclude sensitive data)
    const publicSettings = {
      site_name: allSettings.site_name,
      site_description: allSettings.site_description,
      site_logo: allSettings.site_logo,
      site_favicon: allSettings.site_favicon,
      contact_email: allSettings.contact_email,
      contact_phone: allSettings.contact_phone,
      // Header menu items (JSON string)
      header_menu: allSettings.header_menu || '[]',
      // Social links
      social_facebook: allSettings.social_facebook,
      social_twitter: allSettings.social_twitter,
      social_instagram: allSettings.social_instagram,
      social_youtube: allSettings.social_youtube,
      social_tiktok: allSettings.social_tiktok,
      social_discord: allSettings.social_discord,
      social_line: allSettings.social_line,
    };

    return NextResponse.json(publicSettings);
  } catch (error) {
    console.error('Error fetching public settings:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
