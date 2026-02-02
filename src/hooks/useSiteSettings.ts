'use client';

import { useState, useEffect } from 'react';

interface SiteSettings {
  site_name: string;
  site_description: string;
  site_logo: string;
  site_favicon: string;
  contact_email: string;
  contact_phone: string;
  header_menu: string;
  social_facebook?: string;
  social_twitter?: string;
  social_instagram?: string;
  social_youtube?: string;
  social_tiktok?: string;
  social_discord?: string;
  social_line?: string;
}

// Empty initial state - will be replaced by fetched data
const emptySettings: SiteSettings = {
  site_name: '',
  site_description: '',
  site_logo: '',
  site_favicon: '',
  contact_email: '',
  contact_phone: '',
  header_menu: '[]',
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(emptySettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  return { settings, isLoading };
}
