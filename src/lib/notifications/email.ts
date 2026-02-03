interface OrderEmailOptions {
  email: string;
  name: string;
  orderId: string;
  items: { product: { title: string; artist: string; coverImage: string }; price: number }[];
  totalAmount: number;
}

interface TopUpEmailOptions {
  email: string;
  name: string;
  amount: number;
  status: 'APPROVED' | 'REJECTED';
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Using Resend API for sending emails
// Set RESEND_API_KEY in .env to enable email notifications

import { prisma } from '@/lib/prisma';

// Generic send email function
export async function sendEmail(options: SendEmailOptions) {
  // Try getting key from DB first, then Env
  const setting = await prisma.siteSetting.findUnique({
    where: { key: 'resend_api_key' },
  });
  
  const apiKey = setting?.value || process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.warn('Resend API key not configured, skipping email');
    return;
  }

  const { to, subject, html } = options;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'R9Club Radio <noreply@r9clubradio.com>',
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      throw new Error(`Resend API failed: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}

export async function sendOrderConfirmationEmail(options: OrderEmailOptions) {
  // Try getting key from DB first, then Env
  const setting = await prisma.siteSetting.findUnique({
    where: { key: 'resend_api_key' },
  });
  
  const apiKey = setting?.value || process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.warn('Resend API key not configured, skipping email');
    return;
  }

  const { email, name, orderId, items, totalAmount } = options;

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 16px 0; border-bottom: 1px solid #333;">
        <div style="display: flex; align-items: center;">
          <img src="${item.product.coverImage}" alt="${item.product.title}" 
               style="width: 48px; height: 48px; border-radius: 8px; object-cover: cover; background: #333; margin-right: 16px;">
          <div>
            <p style="margin: 0; font-weight: 500; font-size: 14px; color: #fff;">${item.product.title}</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #888;">${item.product.artist}</p>
          </div>
        </div>
      </td>
      <td style="padding: 16px 0; border-bottom: 1px solid #333; text-align: right; vertical-align: middle;">
        <span style="color: #fff; font-weight: 500;">฿${item.price.toLocaleString()}</span>
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      
      <!-- Main Container -->
      <div style="max-width: 600px; margin: 0 auto; background-color: #000000;">
        
        <!-- Header -->
        <div style="background: linear-gradient(to right, #7e22ce, #ec4899); padding: 2px;">
          <div style="background: #000000; padding: 32px 24px; text-align: center;">
            <h1 style="color: #fff; margin: 0 0 8px; font-size: 24px; letter-spacing: -0.5px;">R9CLUB RADIO</h1>
            <p style="color: #a855f7; margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Order Confirmed</p>
          </div>
        </div>

        <!-- Content -->
        <div style="padding: 24px;">
          <h2 style="color: #fff; margin: 0 0 16px; font-size: 20px;">ขอบคุณสำหรับการสั่งซื้อ! 🎵</h2>
          <p style="color: #a1a1aa; margin: 0 0 24px; font-size: 15px; line-height: 1.6;">
            สวัสดีคุณ <strong style="color: #fff;">${name}</strong>,<br>
            รายการคำสั่งซื้อของคุณได้รับการยืนยันเรียบร้อยแล้ว คุณสามารถดาวน์โหลดไฟล์เพลงได้ทันที
          </p>

          <!-- Order Card -->
          <div style="background: #111111; border: 1px solid #27272a; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #27272a;">
              <span style="color: #71717a; font-size: 13px;">Order ID</span>
              <span style="color: #fff; font-family: monospace; font-size: 14px; background: #27272a; padding: 4px 8px; border-radius: 4px;">#${orderId.slice(0, 8)}</span>
            </div>

            <table style="width: 100%; border-collapse: collapse;">
              ${itemsHtml}
            </table>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #27272a; display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #fff; font-weight: 600;">ยอดสุทธิ</span>
              <span style="color: #22c55e; font-weight: 700; font-size: 20px;">฿${totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard/downloads" 
               style="display: inline-block; background: #fff; color: #000; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 16px; transition: transform 0.2s;">
              ดาวน์โหลดไฟล์เพลง
            </a>
            <p style="margin-top: 12px; font-size: 13px; color: #52525b;">ลิงก์ดาวน์โหลดมีอายุ 30 วัน</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #1f1f1f; padding: 24px; text-align: center;">
          <p style="color: #52525b; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} R9Club Radio. All rights reserved.</p>
          <p style="color: #52525b; font-size: 12px; margin: 8px 0 0;">
            <a href="${process.env.NEXTAUTH_URL}" style="color: #71717a; text-decoration: none;">เว็บไซต์</a> • 
            <a href="mailto:support@r9clubradio.com" style="color: #71717a; text-decoration: none;">ติดต่อเรา</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'R9Club Radio <noreply@r9clubradio.com>',
        to: email,
        subject: `✅ ยืนยันคำสั่งซื้อ #${orderId.slice(0, 8)}`,
        html,
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend API failed: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Email notification error:', error);
    // Don't throw, just log so flow continues
    // throw error; 
  }
}

export async function sendTopUpStatusEmail(options: TopUpEmailOptions) {
  // Try getting key from DB first, then Env
  const setting = await prisma.siteSetting.findUnique({
    where: { key: 'resend_api_key' },
  });
  
  const apiKey = setting?.value || process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.warn('Resend API key not configured, skipping email');
    return;
  }

  const { email, name, amount, status } = options;
  const isApproved = status === 'APPROVED';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 32px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #a855f7; margin: 0;">R9Club Music</h1>
        <p style="color: #888; margin-top: 8px;">แจ้งผลการเติมเงิน</p>
      </div>

      <p>สวัสดีคุณ ${name},</p>
      
      ${isApproved ? `
        <div style="background: #052e16; border: 1px solid #22c55e; border-radius: 12px; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; color: #22c55e; font-size: 18px; font-weight: bold;">
            ✅ เติมเงินสำเร็จ!
          </p>
          <p style="margin: 8px 0 0; color: #86efac;">
            จำนวน ฿${amount.toLocaleString()} เครดิตเข้าบัญชีแล้ว
          </p>
        </div>
      ` : `
        <div style="background: #450a0a; border: 1px solid #ef4444; border-radius: 12px; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; color: #ef4444; font-size: 18px; font-weight: bold;">
            ❌ การเติมเงินถูกปฏิเสธ
          </p>
          <p style="margin: 8px 0 0; color: #fca5a5;">
            จำนวน ฿${amount.toLocaleString()} ไม่ได้รับการอนุมัติ
          </p>
        </div>
      `}

      ${!isApproved ? `
        <p>กรุณาตรวจสอบข้อมูลการโอนเงินและลองใหม่อีกครั้ง หรือติดต่อเจ้าหน้าที่</p>
      ` : `
        <p>คุณสามารถใช้เครดิตซื้อเพลงได้ทันที!</p>
        <a href="${process.env.NEXTAUTH_URL}/products" 
           style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #a855f7, #ec4899); color: #fff; text-decoration: none; border-radius: 8px; margin: 16px 0;">
          เลือกซื้อเพลง
        </a>
      `}

      <hr style="border: none; border-top: 1px solid #333; margin: 32px 0;" />

      <p style="color: #888; font-size: 14px; text-align: center;">
        หากมีคำถาม ติดต่อเราได้ที่ support@r9clubradio.com
      </p>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'R9Club Music <noreply@r9clubradio.com>',
        to: email,
        subject: isApproved 
          ? `✅ เติมเงินสำเร็จ ฿${amount.toLocaleString()}`
          : `❌ การเติมเงินถูกปฏิเสธ`,
        html,
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend API failed: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Email notification error:', error);
    throw error;
  }
}
