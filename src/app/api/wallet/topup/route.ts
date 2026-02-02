import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// POST - Create top-up request
export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { amount, slipImageUrl } = await request.json();

    if (!amount || amount < 10) {
      return NextResponse.json({ error: 'จำนวนเงินขั้นต่ำ 10 บาท' }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: 'TOPUP',
        amount,
        slipImageUrl: slipImageUrl || null,
        status: 'PENDING',
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Top-up error:', error);
    return NextResponse.json({ error: 'Failed to create top-up request' }, { status: 500 });
  }
}
