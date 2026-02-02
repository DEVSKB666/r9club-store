import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { sendDiscordNotification } from '@/lib/notifications/discord';
import { sendTopUpStatusEmail } from '@/lib/notifications/email';

// PUT - Approve or reject transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action, adminNote } = await request.json();

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.status !== 'PENDING') {
      return NextResponse.json({ error: 'Transaction already processed' }, { status: 400 });
    }

    const status = action === 'approve' ? 'APPROVED' : 'REJECTED';

    if (action === 'approve') {
      // Use database transaction to ensure atomicity
      await prisma.$transaction([
        // Update transaction status
        prisma.transaction.update({
          where: { id: params.id },
          data: {
            status: 'APPROVED',
            approvedById: session.user.id,
            adminNote,
          },
        }),
        // Add credit to user's wallet
        prisma.user.update({
          where: { id: transaction.userId },
          data: {
            creditBalance: {
              increment: transaction.amount,
            },
          },
        }),
      ]);
    } else if (action === 'reject') {
      await prisma.transaction.update({
        where: { id: params.id },
        data: {
          status: 'REJECTED',
          approvedById: session.user.id,
          adminNote,
        },
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Send notifications (non-blocking)
    try {
      await sendDiscordNotification({
        type: 'topup',
        data: {
          userName: transaction.user.name || transaction.user.email,
          totalAmount: transaction.amount,
          transactionId: transaction.id,
          status,
        },
      });
    } catch (e) {
      console.error('Discord notification failed:', e);
    }

    try {
      await sendTopUpStatusEmail({
        email: transaction.user.email,
        name: transaction.user.name || 'ลูกค้า',
        amount: transaction.amount,
        status: status as 'APPROVED' | 'REJECTED',
      });
    } catch (e) {
      console.error('Email notification failed:', e);
    }

    return NextResponse.json({ success: true, action: action === 'approve' ? 'approved' : 'rejected' });
  } catch (error) {
    console.error('Transaction action error:', error);
    return NextResponse.json({ error: 'Failed to process transaction' }, { status: 500 });
  }
}
