import { prisma } from './prisma';

// Default settings values (empty - must be configured in admin)
const defaultSettings: Record<string, string> = {
  // General
  site_name: '',
  site_description: '',
  site_logo: '',
  site_favicon: '',
  contact_email: '',
  contact_phone: '',
  contact_address: '',
  header_menu: '[]',
  
  // SEO
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  og_image: '',
  google_analytics_id: '',
  facebook_pixel_id: '',
  
  // Social Media
  social_facebook: '',
  social_twitter: '',
  social_instagram: '',
  social_youtube: '',
  social_tiktok: '',
  social_discord: '',
  social_line: '',
  
  // Payment
  bank_name: '',
  bank_account_name: '',
  bank_account_number: '',
  promptpay_number: '',
  min_topup_amount: '10',
  
  // System
  maintenance_mode: 'false',
  allow_registration: 'true',
  currency_symbol: '฿',
  currency_code: 'THB',
  
  // Discord Notifications
  discord_webhook_url: '',
  discord_notify_login: 'false',
  discord_notify_register: 'true',
  discord_notify_order: 'true',
  discord_notify_topup: 'true',
  discord_notify_admin_credit: 'true',
  discord_notify_upload: 'false',
  discord_notify_product_add: 'true',
};

// No caching - always fetch fresh from database
/**
 * Clear the settings cache (no-op, kept for API compatibility)
 */
export function clearSettingsCache() {
  // No caching, nothing to clear
}

/**
 * Get all site settings (always fresh from database)
 */
export async function getSiteSettings(): Promise<Record<string, string>> {
  try {
    const settings = await prisma.siteSetting.findMany();
    
    // Merge with defaults
    const result = { ...defaultSettings };
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }

    return result;
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return defaultSettings;
  }
}

/**
 * Get a single setting value
 */
export async function getSetting(key: string): Promise<string> {
  const settings = await getSiteSettings();
  return settings[key] ?? defaultSettings[key] ?? '';
}

/**
 * Get multiple settings by keys
 */
export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const allSettings = await getSiteSettings();
  const result: Record<string, string> = {};
  for (const key of keys) {
    result[key] = allSettings[key] ?? defaultSettings[key] ?? '';
  }
  return result;
}

/**
 * Get SEO settings for metadata
 */
export async function getSeoSettings() {
  return getSettings([
    'meta_title',
    'meta_description',
    'meta_keywords',
    'og_image',
    'site_name',
  ]);
}

/**
 * Get social media links
 */
export async function getSocialLinks() {
  const settings = await getSiteSettings();
  return {
    facebook: settings.social_facebook,
    twitter: settings.social_twitter,
    instagram: settings.social_instagram,
    youtube: settings.social_youtube,
    tiktok: settings.social_tiktok,
    discord: settings.social_discord,
    line: settings.social_line,
  };
}

/**
 * Get payment/bank settings
 */
export async function getPaymentSettings() {
  return getSettings([
    'bank_name',
    'bank_account_name',
    'bank_account_number',
    'promptpay_number',
    'min_topup_amount',
  ]);
}

/**
 * Check if maintenance mode is enabled
 */
export async function isMaintenanceMode(): Promise<boolean> {
  const setting = await getSetting('maintenance_mode');
  return setting === 'true';
}

/**
 * Check if registration is allowed
 */
export async function isRegistrationAllowed(): Promise<boolean> {
  const setting = await getSetting('allow_registration');
  return setting !== 'false';
}
