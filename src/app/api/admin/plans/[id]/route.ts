import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// PUT - Update plan
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();

    const plan = await prisma.plan.update({
      where: { id: params.id },
      data: {
        name: data.name,
        price: data.price,
        period: data.period,
        icon: data.icon,
        color: data.color,
        features: JSON.stringify(data.features || []),
        buttonText: data.buttonText,
        buttonUrl: data.buttonUrl,
        isPopular: data.isPopular,
        isActive: data.isActive,
        order: data.order,
      },
    });

    revalidatePath('/admin/plans');
    revalidatePath('/');

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Update plan error:', error);
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
  }
}

// DELETE - Delete plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.plan.delete({
      where: { id: params.id },
    });

    revalidatePath('/admin/plans');
    revalidatePath('/');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete plan error:', error);
    return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
  }
}
