import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET - List all team members (public)
export async function GET() {
  const members = await prisma.teamMember.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  return NextResponse.json(members);
}

// POST - Create new team member (admin only)
export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();

    const member = await prisma.teamMember.create({
      data: {
        name: data.name,
        role: data.role,
        image: data.image,
        description: data.description,
        socialLinks: JSON.stringify(data.socialLinks || {}),
        isActive: data.isActive ?? true,
        order: data.order || 0,
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error('Create team member error:', error);
    return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 });
  }
}
