import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { randomInt } from 'crypto';
import nodemailer from 'nodemailer';

// Rate limit: max 3 OTP per hour per email
const RATE_LIMIT_HOURS = 1;
const RATE_LIMIT_COUNT = 3;
const OTP_EXPIRES_MINUTES = 5;

// Get SMTP settings from database
async function getSmtpSettings() {
  const settings = await prisma.siteSetting.findMany({
    where: {
      key: {
        in: ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_from', 'smtp_from_name', 'site_name'],
      },
    },
  });

  const settingsMap = Object.fromEntries(
    settings.map((s: { key: string; value: string }) => [s.key, s.value])
  );

  return {
    host: settingsMap['smtp_host'] || process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(settingsMap['smtp_port'] || process.env.SMTP_PORT || '587'),
    user: settingsMap['smtp_user'] || process.env.SMTP_USER,
    pass: settingsMap['smtp_pass'] || process.env.SMTP_PASS,
    from: settingsMap['smtp_from'] || process.env.SMTP_FROM || settingsMap['smtp_user'] || process.env.SMTP_USER,
    fromName: settingsMap['smtp_from_name'] || settingsMap['site_name'] || process.env.SITE_NAME || 'R9Club Radio',
  };
}

// Create email transporter
async function getEmailTransporter() {
  const smtp = await getSmtpSettings();

  return {
    transporter: nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: false,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
    }),
    from: smtp.from,
    fromName: smtp.fromName,
  };
}

// Generate 6-digit OTP
function generateOTP(): string {
  return randomInt(100000, 999999).toString();
}

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { email, type, relatedId } = await request.json();

    if (!email || !type) {
      return NextResponse.json({ error: 'กรุณาระบุอีเมลและประเภท' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'รูปแบบอีเมลไม่ถูกต้อง' }, { status: 400 });
    }

    // Check rate limit
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - RATE_LIMIT_HOURS);

    const recentCount = await prisma.emailVerification.count({
      where: {
        email,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentCount >= RATE_LIMIT_COUNT) {
      return NextResponse.json(
        { error: 'ส่ง OTP เกินจำนวนที่กำหนด กรุณารอ 1 ชั่วโมง' },
        { status: 429 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRES_MINUTES);

    // Save to database
    await prisma.emailVerification.create({
      data: {
        email,
        otp,
        type,
        relatedId,
        expiresAt,
      },
    });

    // Send email
    const { transporter, from, fromName } = await getEmailTransporter();

    await transporter.sendMail({
      from: `"${fromName}" <${from}>`,
      to: email,
      subject: `รหัสยืนยัน ${otp} - ${fromName}`,
      html: `
        <div style="font-family: 'Prompt', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8b5cf6; margin: 0;">${fromName}</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); border-radius: 16px; padding: 30px; color: white;">
            <h2 style="margin-top: 0; text-align: center;">รหัสยืนยันของคุณ</h2>
            
            <div style="background: rgba(139, 92, 246, 0.2); border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
              <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #a78bfa;">
                ${otp}
              </div>
            </div>
            
            <p style="text-align: center; color: #9ca3af; margin-bottom: 0;">
              รหัสนี้จะหมดอายุใน ${OTP_EXPIRES_MINUTES} นาที
            </p>
          </div>
          
          <p style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px;">
            หากคุณไม่ได้ขอรหัสนี้ กรุณาเพิกเฉยอีเมลนี้
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'ส่งรหัส OTP ไปยังอีเมลแล้ว',
      expiresIn: OTP_EXPIRES_MINUTES * 60, // seconds
    });
  } catch (error) {
    console.error('Send OTP error details:', error);
    // Log SMTP settings (masking password) for debugging
    try {
        const { transporter } = await getEmailTransporter();
        const options = (transporter as any).options;
        console.log('SMTP Config Check:', {
            host: options.host,
            port: options.port,
            user: options.auth?.user,
            pass: options.auth?.pass ? '******' : 'MISSING',
            secure: options.secure
        });
    } catch (e) {
        console.error('Error checking SMTP config:', e);
    }

    return NextResponse.json(
      { error: `ไม่สามารถส่ง OTP ได้: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
