import { getSiteSettings } from '@/lib/settings';
import { Header } from './Header';

export async function HeaderWrapper() {
  const settings = await getSiteSettings();
  
  // Parse menu items
  let menuItems: { label: string; url: string }[] = [];
  try {
    const menu = JSON.parse(settings.header_menu || '[]');
    menuItems = Array.isArray(menu) ? menu : [];
  } catch {
    menuItems = [];
  }

  return (
    <Header 
      initialSettings={{
        site_name: settings.site_name || '',
        site_logo: settings.site_logo || '',
        site_description: settings.site_description || '',
      }}
      initialMenuItems={menuItems}
    />
  );
}
