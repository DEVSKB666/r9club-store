import { prisma } from '@/lib/prisma';

// Notification Types
export type DiscordNotificationType = 
  | 'login' 
  | 'register' 
  | 'order' 
  | 'topup' 
  | 'admin_credit' 
  | 'upload' 
  | 'product_add';

interface DiscordNotificationData {
  // User info
  userName?: string;
  userEmail?: string;
  userId?: string;
  
  // Order
  orderItems?: { product: { title: string; artist: string }; price: number }[];
  totalAmount?: number;
  
  // Transaction
  transactionId?: string;
  status?: string;
  
  // Admin credit
  adminName?: string;
  creditAmount?: number;
  reason?: string;
  
  // Upload
  fileName?: string;
  fileType?: string;
  fileUrl?: string;
  
  // Product
  productTitle?: string;
  productArtist?: string;
  productPrice?: number;
  productCover?: string;
}

interface DiscordNotificationOptions {
  type: DiscordNotificationType;
  data: DiscordNotificationData;
}

// Setting keys mapping
const NOTIFICATION_SETTINGS: Record<DiscordNotificationType, string> = {
  login: 'discord_notify_login',
  register: 'discord_notify_register',
  order: 'discord_notify_order',
  topup: 'discord_notify_topup',
  admin_credit: 'discord_notify_admin_credit',
  upload: 'discord_notify_upload',
  product_add: 'discord_notify_product_add',
};

// Get Discord settings from database
async function getDiscordSettings(): Promise<{ webhookUrl: string; enabledTypes: Set<DiscordNotificationType> }> {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: ['discord_webhook_url', ...Object.values(NOTIFICATION_SETTINGS)]
        }
      }
    });

    const settingsMap = new Map(settings.map(s => [s.key, s.value]));
    const webhookUrl = settingsMap.get('discord_webhook_url') || '';
    
    const enabledTypes = new Set<DiscordNotificationType>();
    for (const [type, settingKey] of Object.entries(NOTIFICATION_SETTINGS)) {
      if (settingsMap.get(settingKey) === 'true') {
        enabledTypes.add(type as DiscordNotificationType);
      }
    }

    return { webhookUrl, enabledTypes };
  } catch (error) {
    console.error('Error fetching Discord settings:', error);
    return { webhookUrl: '', enabledTypes: new Set() };
  }
}

// Build embed based on notification type
function buildEmbed(options: DiscordNotificationOptions) {
  const { type, data } = options;
  const timestamp = new Date().toISOString();

  switch (type) {
    case 'login':
      return {
        title: '🔐 มีการเข้าสู่ระบบ',
        color: 0x3b82f6, // blue
        fields: [
          { name: '👤 ผู้ใช้', value: data.userName || data.userEmail || 'Unknown', inline: true },
          { name: '📧 อีเมล', value: data.userEmail || '-', inline: true },
        ],
        timestamp,
      };

    case 'register':
      return {
        title: '🎉 สมาชิกใหม่!',
        color: 0x22c55e, // green
        fields: [
          { name: '👤 ชื่อ', value: data.userName || 'ไม่ระบุ', inline: true },
          { name: '📧 อีเมล', value: data.userEmail || '-', inline: true },
        ],
        timestamp,
      };

    case 'order':
      return {
        title: '🛒 คำสั่งซื้อใหม่!',
        color: 0x22c55e, // green
        fields: [
          { name: '👤 ลูกค้า', value: data.userName || 'Unknown', inline: true },
          { name: '💰 ยอดรวม', value: `฿${data.totalAmount?.toLocaleString() || 0}`, inline: true },
          { 
            name: '🎵 รายการสินค้า', 
            value: data.orderItems?.map(i => `• ${i.product.title} - ${i.product.artist}`).join('\n') || '-' 
          },
        ],
        timestamp,
      };

    case 'topup':
      const statusEmoji = data.status === 'COMPLETED' ? '✅' : data.status === 'PENDING' ? '⏳' : '❌';
      const statusText = data.status === 'COMPLETED' ? 'สำเร็จ' : data.status === 'PENDING' ? 'รอตรวจสอบ' : 'ปฏิเสธ';
      return {
        title: '💳 เติมเงิน',
        color: data.status === 'COMPLETED' ? 0x22c55e : data.status === 'PENDING' ? 0xeab308 : 0xef4444,
        fields: [
          { name: '👤 ผู้ใช้', value: data.userName || 'Unknown', inline: true },
          { name: '💰 จำนวนเงิน', value: `฿${data.totalAmount?.toLocaleString() || 0}`, inline: true },
          { name: `${statusEmoji} สถานะ`, value: statusText, inline: true },
        ],
        footer: { text: `Transaction ID: ${data.transactionId || 'N/A'}` },
        timestamp,
      };

    case 'admin_credit':
      return {
        title: '👑 Admin เพิ่มเครดิต',
        color: 0xf59e0b, // amber
        fields: [
          { name: '👤 ผู้รับ', value: data.userName || 'Unknown', inline: true },
          { name: '💰 จำนวน', value: `฿${data.creditAmount?.toLocaleString() || 0}`, inline: true },
          { name: '🔧 โดย Admin', value: data.adminName || 'Unknown', inline: true },
          { name: '📝 หมายเหตุ', value: data.reason || '-' },
        ],
        timestamp,
      };

    case 'upload':
      return {
        title: '📤 อัพโหลดไฟล์ใหม่',
        color: 0x8b5cf6, // purple
        fields: [
          { name: '📁 ไฟล์', value: data.fileName || 'Unknown', inline: true },
          { name: '📂 ประเภท', value: data.fileType || 'Unknown', inline: true },
          { name: '👤 โดย', value: data.userName || 'Unknown', inline: true },
        ],
        timestamp,
      };

    case 'product_add':
      return {
        title: '🎵 สินค้าใหม่!',
        color: 0xec4899, // pink
        thumbnail: data.productCover ? { url: data.productCover } : undefined,
        fields: [
          { name: '🎶 ชื่อเพลง', value: data.productTitle || 'Unknown', inline: true },
          { name: '🎤 ศิลปิน', value: data.productArtist || 'Unknown', inline: true },
          { name: '💰 ราคา', value: `฿${data.productPrice?.toLocaleString() || 0}`, inline: true },
        ],
        timestamp,
      };

    default:
      return null;
  }
}

export async function sendDiscordNotification(options: DiscordNotificationOptions) {
  try {
    // Get settings from database
    const { webhookUrl, enabledTypes } = await getDiscordSettings();
    
    // Fallback to environment variable if database is empty
    const finalWebhookUrl = webhookUrl || process.env.DISCORD_WEBHOOK_URL;
    
    if (!finalWebhookUrl) {
      console.warn('Discord webhook URL not configured');
      return false;
    }

    // Check if this notification type is enabled
    if (webhookUrl && !enabledTypes.has(options.type)) {
      console.log(`Discord notification type '${options.type}' is disabled`);
      return false;
    }

    const embed = buildEmbed(options);
    if (!embed) {
      console.warn(`Unknown notification type: ${options.type}`);
      return false;
    }

    const response = await fetch(finalWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'R9Club Music Bot',
        avatar_url: 'https://r9clubradio.com/logo.png',
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Discord notification error:', error);
    return false;
  }
}

// Test webhook connection
export async function testDiscordWebhook(webhookUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'R9Club Music Bot',
        avatar_url: 'https://r9clubradio.com/logo.png',
        embeds: [{
          title: '✅ ทดสอบการเชื่อมต่อสำเร็จ!',
          description: 'Discord Webhook ใช้งานได้ปกติ',
          color: 0x22c55e,
          timestamp: new Date().toISOString(),
        }],
      }),
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
