import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET - List all FAQs (public)
export async function GET() {
  const faqs = await prisma.fAQ.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  return NextResponse.json(faqs);
}

// POST - Create new FAQ (admin only)
export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();

    const faq = await prisma.fAQ.create({
      data: {
        question: data.question,
        answer: data.answer,
        category: data.category || 'general',
        icon: data.icon,
        isActive: data.isActive ?? true,
        order: data.order || 0,
      },
    });

    return NextResponse.json(faq);
  } catch (error) {
    console.error('Create FAQ error:', error);
    return NextResponse.json({ error: 'Failed to create FAQ' }, { status: 500 });
  }
}
