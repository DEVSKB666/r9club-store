import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { sendDiscordNotification } from '@/lib/notifications/discord';

// POST - Admin เพิ่มเครดิตให้ User
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, amount, reason } = await request.json();

    if (!userId || !amount) {
      return NextResponse.json(
        { error: 'กรุณาระบุ userId และ amount' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'จำนวนเครดิตต้องมากกว่า 0' },
        { status: 400 }
      );
    }

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'ไม่พบผู้ใช้' },
        { status: 404 }
      );
    }

    // Update user credit
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        creditBalance: { increment: amount },
      },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: userId,
        type: 'TOPUP',
        amount: amount,
        status: 'APPROVED',
        adminNote: reason || `Admin เพิ่มเครดิตโดย ${session.user.name || session.user.email}`,
        approvedById: session.user.id,
      },
    });

    // Send Discord notification
    sendDiscordNotification({
      type: 'admin_credit',
      data: {
        userName: updatedUser.name || updatedUser.email,
        creditAmount: amount,
        adminName: session.user.name || session.user.email,
        reason: reason || 'ไม่ระบุ',
      },
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      message: `เพิ่มเครดิต ${amount.toLocaleString()} บาท สำเร็จ`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        creditBalance: updatedUser.creditBalance,
      },
    });
  } catch (error) {
    console.error('Add credit error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}
