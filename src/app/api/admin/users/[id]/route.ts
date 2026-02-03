import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { sendDiscordNotification } from '@/lib/notifications/discord';
import { revalidatePath } from 'next/cache';

// GET - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}

// PUT - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, role, creditBalance, addCredit, creditReason } = await request.json();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 });
    }

    // Build update data
    const updateData: { name?: string; role?: 'USER' | 'ADMIN'; creditBalance?: { increment: number } } = {};
    
    if (name !== undefined) updateData.name = name;
    if (role !== undefined && ['USER', 'ADMIN'].includes(role)) {
      updateData.role = role;
    }

    // Handle credit addition separately
    let creditAdded = 0;
    if (addCredit && addCredit > 0) {
      updateData.creditBalance = { increment: addCredit };
      creditAdded = addCredit;

      // Create transaction record for credit addition
      await prisma.transaction.create({
        data: {
          userId: params.id,
          type: 'TOPUP',
          amount: addCredit,
          status: 'APPROVED',
          adminNote: creditReason || `Admin เพิ่มเครดิตโดย ${session.user.name || session.user.email}`,
          approvedById: session.user.id,
        },
      });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
    });

    // Send Discord notification if credit was added
    if (creditAdded > 0) {
      sendDiscordNotification({
        type: 'admin_credit',
        data: {
          userName: updatedUser.name || updatedUser.email,
          creditAmount: creditAdded,
          adminName: session.user.name || session.user.email,
          reason: creditReason || 'ไม่ระบุ',
        },
      }).catch(console.error);
    }

    revalidatePath('/admin/users');

    return NextResponse.json({
      success: true,
      message: 'อัปเดตข้อมูลสำเร็จ',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Prevent self-deletion
    if (params.id === session.user.id) {
      return NextResponse.json({ error: 'ไม่สามารถลบตัวเองได้' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id: params.id },
    });

    revalidatePath('/admin/users');

    return NextResponse.json({
      success: true,
      message: 'ลบผู้ใช้สำเร็จ',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
