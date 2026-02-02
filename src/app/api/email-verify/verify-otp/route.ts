import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { SignJWT } from 'jose';

const MAX_ATTEMPTS = 5;
const TOKEN_EXPIRES_MINUTES = 10;

// Generate verification token (JWT)
async function generateVerificationToken(email: string, type: string, relatedId?: string) {
  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
  
  const token = await new SignJWT({ email, type, relatedId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${TOKEN_EXPIRES_MINUTES}m`)
    .setIssuedAt()
    .sign(secret);
  
  return token;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { email, otp, type, relatedId } = await request.json();

    if (!email || !otp || !type) {
      return NextResponse.json({ error: 'กรุณาระบุข้อมูลให้ครบ' }, { status: 400 });
    }

    // Find the OTP record
    const verification = await prisma.emailVerification.findFirst({
      where: {
        email,
        type,
        verified: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'รหัส OTP หมดอายุหรือไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // Check attempts
    if (verification.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: 'ใส่ OTP ผิดเกินจำนวนที่กำหนด กรุณาขอรหัสใหม่' },
        { status: 429 }
      );
    }

    // Verify OTP
    if (verification.otp !== otp) {
      // Increment attempts
      await prisma.emailVerification.update({
        where: { id: verification.id },
        data: { attempts: { increment: 1 } },
      });

      const remainingAttempts = MAX_ATTEMPTS - verification.attempts - 1;
      return NextResponse.json(
        { 
          error: 'รหัส OTP ไม่ถูกต้อง', 
          remainingAttempts 
        },
        { status: 400 }
      );
    }

    // For download type, verify email matches the one used during checkout
    if (type === 'download' && relatedId) {
      const download = await prisma.download.findUnique({
        where: { id: relatedId },
      });

      if (download?.verifiedEmail && download.verifiedEmail !== email) {
        return NextResponse.json(
          { error: 'อีเมลไม่ตรงกับที่ใช้ตอนซื้อ' },
          { status: 403 }
        );
      }
    }

    // Mark as verified
    await prisma.emailVerification.update({
      where: { id: verification.id },
      data: { verified: true },
    });

    // Generate verification token
    const token = await generateVerificationToken(email, type, relatedId);

    return NextResponse.json({
      success: true,
      message: 'ยืนยันอีเมลสำเร็จ',
      verificationToken: token,
      email,
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
      { status: 500 }
    );
  }
}
