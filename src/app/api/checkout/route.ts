import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { sendDiscordNotification } from '@/lib/notifications/discord';
import { sendOrderConfirmationEmail } from '@/lib/notifications/email';
import { randomBytes } from 'crypto';

// POST - Process checkout
export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { items, verifiedEmail } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'ไม่มีสินค้าในตะกร้า' }, { status: 400 });
    }

    // Calculate total
    const totalAmount = items.reduce((sum: number, item: { price: number }) => sum + item.price, 0);

    // Get user and check credit
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.creditBalance < totalAmount) {
      return NextResponse.json({ error: 'เครดิตไม่เพียงพอ' }, { status: 400 });
    }

    // Create order with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          userId: session.user.id,
          totalAmount,
          status: 'COMPLETED',
          email: verifiedEmail || null,
          items: {
            create: items.map((item: { productId: string; price: number }) => ({
              productId: item.productId,
              price: item.price,
            })),
          },
        },
        include: {
          items: { include: { product: true } },
          user: true,
        },
      });

      // Deduct credit
      await tx.user.update({
        where: { id: session.user.id },
        data: { creditBalance: { decrement: totalAmount } },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: session.user.id,
          type: 'PURCHASE',
          amount: totalAmount,
          status: 'APPROVED',
        },
      });

      // Create download links for each product
      for (const item of items) {
        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

        await tx.download.create({
          data: {
            userId: session.user.id,
            productId: item.productId,
            secureToken: token,
            expiresAt,
            verifiedEmail: verifiedEmail || null,
          },
        });
      }

      return order;
    });

    // Send notifications (non-blocking)
    try {
      await sendDiscordNotification({
        type: 'order',
        data: {
          userName: result.user.name || result.user.email,
          orderItems: result.items,
          totalAmount,
        },
      });
    } catch (e) {
      console.error('Discord notification failed:', e);
    }

    try {
      await sendOrderConfirmationEmail({
        email: result.user.email,
        name: result.user.name || 'ลูกค้า',
        orderId: result.id,
        items: result.items,
        totalAmount,
      });
    } catch (e) {
      console.error('Email notification failed:', e);
    }

    return NextResponse.json({
      success: true,
      orderId: result.id,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to process checkout' }, { status: 500 });
  }
}
