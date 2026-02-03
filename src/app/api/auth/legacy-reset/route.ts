import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/notifications/email';

// POST - Send OTP to legacy user email
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: 'กรุณากรอกอีเมล' }, { status: 400 });
    }

    // Find legacy user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, name: true, password: true },
    });

    if (!user) {
      return Response.json({ error: 'ไม่พบผู้ใช้งานนี้ในระบบ' }, { status: 404 });
    }

    // Check if user is legacy (no password)
    if (user.password) {
      return Response.json({ error: 'บัญชีนี้มีรหัสผ่านแล้ว กรุณาเข้าสู่ระบบตามปกติ' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTP for this email
    await prisma.emailVerification.deleteMany({
      where: { email: email.toLowerCase(), type: 'legacy_reset' },
    });

    // Create new OTP record
    await prisma.emailVerification.create({
      data: {
        email: email.toLowerCase(),
        otp,
        type: 'legacy_reset',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    // Send OTP email
    await sendEmail({
      to: email,
      subject: 'ยืนยันตัวตนเพื่อตั้งรหัสผ่านใหม่ - R9CLUB RADIO',
      html: `
        <div style="font-family: 'Prompt', sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #facc15; text-align: center;">🎵 R9CLUB RADIO</h2>
          <p>สวัสดีคุณ <strong>${user.name}</strong>,</p>
          <p>เราพบว่าคุณเป็นลูกค้าจากระบบเก่า กรุณาใช้รหัส OTP ด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>
          <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #facc15; letter-spacing: 8px;">${otp}</span>
          </div>
          <p style="color: #888;">รหัสนี้จะหมดอายุใน 10 นาที</p>
          <p style="color: #888; font-size: 12px;">หากคุณไม่ได้ทำรายการนี้ กรุณาเพิกเฉยอีเมลนี้</p>
        </div>
      `,
    });

    return Response.json({ 
      success: true, 
      message: 'ส่งรหัส OTP ไปยังอีเมลของคุณแล้ว',
      email: email.toLowerCase(),
    });
  } catch (error) {
    console.error('Legacy reset send OTP error:', error);
    return Response.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' }, { status: 500 });
  }
}

// PUT - Verify OTP and set new password
export async function PUT(request: NextRequest) {
  try {
    const { email, otp, password } = await request.json();

    if (!email || !otp || !password) {
      return Response.json({ error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' }, { status: 400 });
    }

    // Find OTP record
    const otpRecord = await prisma.emailVerification.findFirst({
      where: {
        email: email.toLowerCase(),
        otp,
        type: 'legacy_reset',
        expiresAt: { gt: new Date() },
        verified: false,
      },
    });

    if (!otpRecord) {
      return Response.json({ error: 'รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว' }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return Response.json({ error: 'ไม่พบผู้ใช้งาน' }, { status: 404 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Mark OTP as verified
    await prisma.emailVerification.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    return Response.json({ 
      success: true, 
      message: 'ตั้งรหัสผ่านใหม่สำเร็จ! คุณสามารถเข้าสู่ระบบได้แล้ว',
    });
  } catch (error) {
    console.error('Legacy reset verify error:', error);
    return Response.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' }, { status: 500 });
  }
}
