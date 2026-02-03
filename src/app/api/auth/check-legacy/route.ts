import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// POST - Check if user is a legacy user (has no password)
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: 'กรุณากรอกอีเมล' }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        creditBalance: true,
      },
    });

    if (!user) {
      return Response.json({ 
        exists: false,
        isLegacy: false,
        message: 'ไม่พบผู้ใช้งานนี้ในระบบ'
      });
    }

    // Check if user is legacy (no password set)
    const isLegacy = !user.password;

    return Response.json({
      exists: true,
      isLegacy,
      email: user.email,
      name: user.name,
      creditBalance: isLegacy ? user.creditBalance : undefined,
      message: isLegacy 
        ? 'พบบัญชีเดิมของคุณ! กรุณาตั้งรหัสผ่านใหม่เพื่อเข้าสู่ระบบ' 
        : 'กรุณาใส่รหัสผ่านเพื่อเข้าสู่ระบบ'
    });
  } catch (error) {
    console.error('Check legacy error:', error);
    return Response.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' }, { status: 500 });
  }
}
