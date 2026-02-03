'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { HeaderMenuEditor } from '@/components/admin/HeaderMenuEditor';
import swal from '@/lib/swal';
import {
  Cog6ToothIcon,
  GlobeAltIcon,
  ShareIcon,
  CreditCardIcon,
  WrenchScrewdriverIcon,
  ChatBubbleLeftRightIcon,
  CloudArrowDownIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

interface Settings {
  [key: string]: { value: string; group: string };
}

const tabs = [
  { id: 'general', name: 'ทั่วไป', icon: Cog6ToothIcon },
  { id: 'seo', name: 'SEO', icon: GlobeAltIcon },
  { id: 'social', name: 'Social Media', icon: ShareIcon },
  { id: 'payment', name: 'การชำระเงิน', icon: CreditCardIcon },
  { id: 'system', name: 'ระบบ', icon: WrenchScrewdriverIcon },
  { id: 'discord', name: 'Discord', icon: ChatBubbleLeftRightIcon },
  { id: 'googledrive', name: 'Google Drive', icon: CloudArrowDownIcon },
  { id: 'smtp', name: 'การแจ้งเตือน (Email)', icon: EnvelopeIcon },
];

const settingLabels: Record<string, string> = {
  // General
  site_name: 'ชื่อเว็บไซต์',
  site_description: 'คำอธิบายเว็บ',
  site_logo: 'โลโก้เว็บไซต์',
  site_favicon: 'Favicon',
  contact_email: 'อีเมลติดต่อ',
  contact_phone: 'เบอร์โทร',
  contact_address: 'ที่อยู่',
  header_menu: 'เมนู Header (JSON)',
  // SEO
  meta_title: 'Meta Title',
  meta_description: 'Meta Description',
  meta_keywords: 'Meta Keywords',
  og_image: 'OG Image (รูปแชร์)',
  google_analytics_id: 'Google Analytics ID',
  facebook_pixel_id: 'Facebook Pixel ID',
  // Social
  social_facebook: 'Facebook',
  social_twitter: 'Twitter / X',
  social_instagram: 'Instagram',
  social_youtube: 'YouTube',
  social_tiktok: 'TikTok',
  social_discord: 'Discord',
  social_line: 'Line',
  // Payment
  bank_name: 'ชื่อธนาคาร',
  bank_account_name: 'ชื่อบัญชี',
  bank_account_number: 'เลขบัญชี',
  promptpay_number: 'พร้อมเพย์',
  min_topup_amount: 'ยอดเติมเงินขั้นต่ำ (บาท)',
  promptpay_qr: 'QR Code พร้อมเพย์',
  // System
  maintenance_mode: 'โหมดปิดปรับปรุง',
  allow_registration: 'อนุญาตลงทะเบียนใหม่',
  currency_symbol: 'สัญลักษณ์สกุลเงิน',
  currency_code: 'รหัสสกุลเงิน',
  // Discord
  discord_webhook_url: 'Discord Webhook URL',
  discord_notify_login: 'แจ้งเตือนเมื่อมีการเข้าสู่ระบบ',
  discord_notify_register: 'แจ้งเตือนเมื่อมีสมาชิกใหม่',
  discord_notify_order: 'แจ้งเตือนเมื่อมีคำสั่งซื้อ',
  discord_notify_topup: 'แจ้งเตือนเมื่อมีการเติมเงิน',
  discord_notify_admin_credit: 'แจ้งเตือนเมื่อ Admin เพิ่มเครดิต',
  discord_notify_upload: 'แจ้งเตือนเมื่อมีการอัพโหลด',
  discord_notify_product_add: 'แจ้งเตือนเมื่อเพิ่มสินค้าใหม่',
  discord_bot_token: 'Discord Bot Token (สำหรับ Live Chat)',
  discord_ticket_channel_id: 'Ticket Channel ID (ห้องรับเรื่อง)',
  // Google Drive
  google_service_account_email: 'Service Account Email (Legacy)',
  google_folder_id: 'Folder ID',
  google_client_id: 'Client ID (OAuth)',
  google_client_secret: 'Client Secret (OAuth)',
  google_refresh_token: 'Refresh Token (System)',
  google_private_key: 'Private Key (Legacy)',
  // SMTP / Email
  resend_api_key: 'Resend API Key',
  smtp_host: 'SMTP Host',
  smtp_port: 'SMTP Port',
  smtp_user: 'SMTP Username',
  smtp_pass: 'SMTP Password',
  smtp_from: 'ส่งจากอีเมล (From)',
  smtp_from_name: 'ชื่อผู้ส่ง',
};

// Fields that should use ImageUpload component
const imageFields = ['site_logo', 'site_favicon', 'og_image', 'promptpay_qr'];

// Fields that should use toggles
const booleanFields = [
  'maintenance_mode', 
  'allow_registration',
  'discord_notify_login',
  'discord_notify_register',
  'discord_notify_order',
  'discord_notify_topup',
  'discord_notify_admin_credit',
  'discord_notify_upload',
  'discord_notify_product_add',
];

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>({});
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      
      // Merge with default keys to ensure all fields are visible
      const mergedSettings = { ...data.settings };
      
      // Helper to match group logic
      const getGroupFromKey = (k: string) => {
        if (k.startsWith('google_')) return 'googledrive';
        if (k.startsWith('smtp_')) return 'smtp';
        if (k.startsWith('discord_')) return 'discord';
        if (k.startsWith('social_')) return 'social';
        if (k.startsWith('meta_') || k.startsWith('og_') || k.startsWith('google_analytics') || k.startsWith('facebook_pixel')) return 'seo';
        if (k.startsWith('bank_') || k.startsWith('promptpay_') || k.startsWith('min_topup')) return 'payment';
        if (k.startsWith('maintenance') || k.startsWith('allow_') || k.startsWith('currency')) return 'system';
        return 'general';
      };

      // Force ensure google_folder_id exists (Fail-safe)
      ['google_folder_id', 'google_client_id', 'google_client_secret', 'google_refresh_token'].forEach(k => {
        if (!mergedSettings[k]) {
          mergedSettings[k] = { value: '', group: 'googledrive' };
        }
      });

      Object.keys(settingLabels).forEach(key => {
        if (!mergedSettings[key]) {
          mergedSettings[key] = {
            value: '',
            group: getGroupFromKey(key)
          };
        }
      });

      setSettings(mergedSettings);
    } catch (error) {
      swal.error('ไม่สามารถโหลดการตั้งค่าได้');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    // Determine group based on key prefix
    const getGroupFromKey = (k: string) => {
      if (k.startsWith('google_')) return 'googledrive';
      if (k.startsWith('smtp_')) return 'smtp';
      if (k.startsWith('discord_')) return 'discord';
      if (k.startsWith('social_')) return 'social';
      if (k.startsWith('meta_') || k.startsWith('og_') || k.startsWith('google_analytics') || k.startsWith('facebook_pixel')) return 'seo';
      if (k.startsWith('bank_') || k.startsWith('promptpay_') || k.startsWith('min_topup')) return 'payment';
      if (k.startsWith('maintenance') || k.startsWith('allow_') || k.startsWith('currency')) return 'system';
      return 'general';
    };

    setSettings((prev) => ({
      ...prev,
      [key]: { 
        value,
        group: prev[key]?.group || getGroupFromKey(key),
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Convert to simple key-value for API
      const settingsToSave: Record<string, string> = {};
      Object.entries(settings).forEach(([key, { value }]) => {
        settingsToSave[key] = value;
      });

      console.log('Sending settings to save:', settingsToSave);
      console.log('Client ID check:', settingsToSave['google_client_id']);

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsToSave }),
      });

      if (!res.ok) throw new Error('Failed to save');

      swal.success('บันทึกการตั้งค่าสำเร็จ!');
      router.refresh();
    } catch (error) {
      swal.error('ไม่สามารถบันทึกได้');
    } finally {
      setIsSaving(false);
    }
  };

  const getSettingsForTab = (tabId: string) => {
    return Object.entries(settings).filter(([_, { group }]) => group === tabId);
  };

  const renderField = (key: string, value: string) => {
    // Boolean toggle fields
    if (booleanFields.includes(key)) {
      return (
        <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
          <span className="font-medium">{settingLabels[key] || key}</span>
          <button
            onClick={() => handleChange(key, value === 'true' ? 'false' : 'true')}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              value === 'true' ? 'bg-green-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                value === 'true' ? 'left-8' : 'left-1'
              }`}
            />
          </button>
        </div>
      );
    }

    // Header menu editor
    if (key === 'header_menu') {
      return (
        <HeaderMenuEditor
          key={key}
          value={value}
          onChange={(newValue) => handleChange(key, newValue)}
        />
      );
    }

    // Image upload fields
    if (imageFields.includes(key)) {
      return (
        <div key={key} className="md:col-span-1">
          <ImageUpload
            label={settingLabels[key] || key}
            value={value}
            onChange={(url) => handleChange(key, url)}
            placeholder={`เลือก${settingLabels[key]}`}
          />
        </div>
      );
    }

    // Google Drive Private Key field
    if (key === 'google_private_key') {
      return (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-300 mb-1">{settingLabels[key] || key}</label>
          <textarea
            value={value}
            onChange={(e) => handleChange(key, e.target.value)}
            rows={5}
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
            placeholder={'-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----'}
          />
        </div>
      );
    }

    // Regular text input fields
    return (
      <Input
        key={key}
        label={settingLabels[key] || key}
        value={value}
        onChange={(e) => handleChange(key, e.target.value)}
        placeholder={settingLabels[key]}
        description={key === 'google_folder_id' ? 'สร้างโฟลเดอร์ใน Drive ของคุณ > แชร์ให้ Service Account Email (Editor) > ก๊อปปี้ ID จาก URL มาใส่' : undefined}
      />
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ตั้งค่าเว็บไซต์</h1>
          <p className="text-gray-400">จัดการการตั้งค่าทั่วไปและ SEO</p>
        </div>
        <Button onClick={handleSave} isLoading={isSaving}>
          บันทึกการตั้งค่า
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-primary-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Settings Form */}
      <div className="rounded-2xl bg-gray-900/50 border border-white/10 p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {getSettingsForTab(activeTab)
            .filter(([key]) => 
              !key.startsWith('google_') && 
              !key.startsWith('smtp_') && 
              !key.startsWith('resend_') &&
              key !== 'discord_bot_token' &&
              key !== 'discord_ticket_channel_id'
            )
            .map(([key, { value }]) => 
            renderField(key, value)
          )}
          
          {/* Show default fields for new tabs that don't have settings yet */}
          {activeTab === 'googledrive' && (
            <div className="col-span-2 space-y-6">
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <h3 className="text-lg font-bold text-blue-400 mb-2">การเชื่อมต่อ Google Drive (แนะนำ)</h3>
                <p className="text-sm text-gray-300 mb-4">
                  ใช้ระบบ OAuth 2.0 เพื่ออัพโหลดไฟล์โดยใช้พื้นที่ของคุณเอง (แก้ปัญหา Quota เต็ม)
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mb-4">
                  {renderField('google_client_id', settings['google_client_id']?.value || '')}
                  {renderField('google_client_secret', settings['google_client_secret']?.value || '')}
                </div>

                <div className="flex items-center gap-4">
                  {settings['google_refresh_token']?.value ? (
                    <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-4 py-2 rounded-lg">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      เชื่อมต่อแล้ว
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">ยังไม่เชื่อมต่อ</div>
                  )}
                  
                  <Button
                    type="button"
                    disabled={!settings['google_client_id']?.value || !settings['google_client_secret']?.value}
                    onClick={() => {
                        const clientId = settings['google_client_id']?.value;
                        const clientSecret = settings['google_client_secret']?.value;
                        window.location.href = `/api/admin/google/auth?client_id=${clientId}&client_secret=${clientSecret}`;
                    }}
                    className={settings['google_refresh_token']?.value ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-600 hover:bg-blue-500'}
                  >
                    {settings['google_refresh_token']?.value ? 'เชื่อมต่อใหม่' : 'เชื่อมต่อ Google Drive'}
                  </Button>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-bold text-gray-400 mb-4">การตั้งค่าแบบเก่า (Service Account)</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {renderField('google_service_account_email', settings['google_service_account_email']?.value || '')}
                  {renderField('google_private_key', settings['google_private_key']?.value || '')}
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                 {renderField('google_folder_id', settings['google_folder_id']?.value || '')}
              </div>
            </div>
          )}

          {activeTab === 'smtp' && (
            <div className="col-span-2 space-y-6">
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <h3 className="text-lg font-bold text-purple-400 mb-2">Resend Email API</h3>
                <p className="text-sm text-gray-300 mb-4">
                  ใช้สำหรับส่งอีเมลยืนยันคำสั่งซื้อ (แนะนำ)
                </p>
                
                {renderField('resend_api_key', settings['resend_api_key']?.value || '')}
                {renderField('smtp_from', settings['smtp_from']?.value || '')}
              </div>

              <div className="border-t border-white/10 pt-6 opacity-50 hover:opacity-100 transition-opacity">
                <h3 className="text-lg font-bold text-gray-400 mb-4">SMTP Server (สำรอง)</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {renderField('smtp_host', settings['smtp_host']?.value || '')}
                  {renderField('smtp_port', settings['smtp_port']?.value || '')}
                  {renderField('smtp_user', settings['smtp_user']?.value || '')}
                  {renderField('smtp_pass', settings['smtp_pass']?.value || '')}
                  {renderField('smtp_from_name', settings['smtp_from_name']?.value || '')}
                </div>
              </div>
            </div>
          )}
        </div>

        {getSettingsForTab(activeTab).length === 0 && !['googledrive', 'smtp'].includes(activeTab) && (
          <div className="text-center py-12 text-gray-500">
            ไม่มีการตั้งค่าในหมวดนี้
          </div>
        )}
      </div>

      {/* Tab-specific help text */}
      {activeTab === 'seo' && (
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400">
          <strong>เคล็ดลับ SEO:</strong> Meta Title ควรมีความยาว 50-60 ตัวอักษร, 
          Meta Description ควรมีความยาว 150-160 ตัวอักษร
        </div>
      )}

      {activeTab === 'payment' && (
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-400">
          <strong>หมายเหตุ:</strong> ข้อมูลบัญชีธนาคารจะแสดงในหน้าเติมเงินของผู้ใช้
        </div>
      )}

      {activeTab === 'system' && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          <strong>คำเตือน:</strong> การเปิดโหมดปิดปรับปรุงจะทำให้ผู้ใช้ทั่วไปไม่สามารถเข้าถึงเว็บได้
        </div>
      )}

      {activeTab === 'discord' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <h3 className="text-lg font-bold text-indigo-400 mb-4 flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              ตั้งค่า Live Chat (Discord Ticket)
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
               {renderField('discord_bot_token', settings['discord_bot_token']?.value || '')}
               {renderField('discord_ticket_channel_id', settings['discord_ticket_channel_id']?.value || '')}
            </div>
            <p className="mt-4 text-sm text-gray-400">
              * ต้องใส่ Token และ ID ให้ถูกต้องเพื่อให้ระบบแชทหน้าเว็บทำงานได้
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/20 text-sm text-[#5865F2]">
            <strong>วิธีสร้าง Discord Webhook:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-gray-300">
              <li>เข้า Discord Server → คลิกขวาที่ Channel → Edit Channel</li>
              <li>ไปที่ Integrations → Webhooks → New Webhook</li>
              <li>ตั้งชื่อ และคัดลอก Webhook URL มาวาง</li>
            </ol>
          </div>
          <Button
            type="button"
            onClick={async () => {
              const webhookUrl = settings.discord_webhook_url?.value;
              if (!webhookUrl) {
                swal.error('กรุณากรอก Webhook URL ก่อน');
                return;
              }
              try {
                const res = await fetch('/api/admin/discord/test', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ webhookUrl }),
                });
                const data = await res.json();
                if (data.success) {
                  swal.success('ทดสอบสำเร็จ! เช็ค Discord Channel ของคุณ');
                } else {
                  swal.error(data.error || 'ทดสอบไม่สำเร็จ');
                }
              } catch {
                swal.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
              }
            }}
            className="bg-[#5865F2] hover:bg-[#4752C4]"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z" />
            </svg>
            ทดสอบการเชื่อมต่อ Discord
          </Button>
        </div>
      )}
    </div>
  );
}
