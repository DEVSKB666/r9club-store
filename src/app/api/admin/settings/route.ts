import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Default settings with groups
const defaultSettings: Record<string, { value: string; group: string }> = {
  // General
  site_name: { value: 'R9Club Music Store', group: 'general' },
  site_description: { value: 'ร้านขายเพลงลิขสิทธิ์คุณภาพสูง', group: 'general' },
  site_logo: { value: '/logo.png', group: 'general' },
  site_favicon: { value: '/favicon.ico', group: 'general' },
  contact_email: { value: 'admin@r9club.com', group: 'general' },
  contact_phone: { value: '', group: 'general' },
  contact_address: { value: '', group: 'general' },
  header_menu: { value: '[{"label":"สินค้าทั้งหมด","url":"/products"},{"label":"สินค้าแนะนำ","url":"/products?featured=true"}]', group: 'general' },
  
  // SEO
  meta_title: { value: 'R9Club - ร้านขายเพลงลิขสิทธิ์', group: 'seo' },
  meta_description: { value: 'ซื้อเพลงลิขสิทธิ์คุณภาพสูง ดาวน์โหลดได้ทันที', group: 'seo' },
  meta_keywords: { value: 'เพลง, ลิขสิทธิ์, ดาวน์โหลด, music, download', group: 'seo' },
  og_image: { value: '/og-image.jpg', group: 'seo' },
  google_analytics_id: { value: '', group: 'seo' },
  facebook_pixel_id: { value: '', group: 'seo' },
  
  // Social Media
  social_facebook: { value: '', group: 'social' },
  social_twitter: { value: '', group: 'social' },
  social_instagram: { value: '', group: 'social' },
  social_youtube: { value: '', group: 'social' },
  social_tiktok: { value: '', group: 'social' },
  social_discord: { value: '', group: 'social' },
  social_line: { value: '', group: 'social' },
  
  // Payment
  bank_name: { value: 'กสิกรไทย', group: 'payment' },
  bank_account_name: { value: 'R9Club', group: 'payment' },
  bank_account_number: { value: '', group: 'payment' },
  promptpay_number: { value: '', group: 'payment' },
  promptpay_qr: { value: '', group: 'payment' },
  min_topup_amount: { value: '10', group: 'payment' },
  
  // System
  maintenance_mode: { value: 'false', group: 'system' },
  allow_registration: { value: 'true', group: 'system' },
  currency_symbol: { value: '฿', group: 'system' },
  currency_code: { value: 'THB', group: 'system' },
  
  // Discord Notifications
  discord_webhook_url: { value: '', group: 'discord' },
  discord_notify_login: { value: 'false', group: 'discord' },
  discord_notify_register: { value: 'true', group: 'discord' },
  discord_notify_order: { value: 'true', group: 'discord' },
  discord_notify_topup: { value: 'true', group: 'discord' },
  discord_notify_admin_credit: { value: 'true', group: 'discord' },
  discord_notify_upload: { value: 'false', group: 'discord' },
  discord_notify_product_add: { value: 'true', group: 'discord' },
  
  // Google Drive
  google_service_account_email: { value: '', group: 'googledrive' },
  google_private_key: { value: '', group: 'googledrive' },
  google_folder_id: { value: '', group: 'googledrive' },
  google_client_id: { value: '', group: 'googledrive' },
  google_client_secret: { value: '', group: 'googledrive' },
  google_refresh_token: { value: '', group: 'googledrive' },

  // SMTP / Email
  resend_api_key: { value: '', group: 'smtp' },
  smtp_host: { value: '', group: 'smtp' },
  smtp_port: { value: '587', group: 'smtp' },
  smtp_user: { value: '', group: 'smtp' },
  smtp_pass: { value: '', group: 'smtp' },
  smtp_from: { value: 'noreply@r9club.com', group: 'smtp' },
  smtp_from_name: { value: 'R9Club Team', group: 'smtp' },
};

// GET - Fetch all settings
export async function GET() {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await prisma.siteSetting.findMany();
    
    // Merge with defaults
    const settingsMap: Record<string, { value: string; group: string }> = { ...defaultSettings };
    
    for (const setting of settings) {
      settingsMap[setting.key] = { value: setting.value, group: setting.group };
    }

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}

// PUT - Update settings (expects { settings: { key: value, ... } })
export async function PUT(request: Request) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings format' }, { status: 400 });
    }

    // Upsert each setting
    console.log('Received settings to update:', Object.keys(settings));
    
    const updates = Object.entries(settings).map(([key, value]) => {
      const group = defaultSettings[key]?.group || 'general';
      return prisma.siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value), group },
      });
    });

    await prisma.$transaction(updates);

    revalidatePath('/admin/settings');
    revalidatePath('/');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
