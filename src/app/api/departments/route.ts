import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        categories: {
          select: { id: true, name: true, description: true },
        },
        _count: {
          select: { complaints: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        departmentId: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ departments, categories });
  } catch (error) {
    console.error('Fetch departments error:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}
