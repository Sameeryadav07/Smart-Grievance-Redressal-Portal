import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { complaintUpdateSchema } from '@/schemas/complaint';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const isNumeric = /^\d+$/.test(id);

    const complaint = await prisma.complaint.findFirst({
      where: isNumeric
        ? { OR: [{ id: parseInt(id, 10) }, { trackingId: id }] }
        : { trackingId: id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        department: true,
        category: true,
        aiAnalysis: true,
        updates: {
          orderBy: { createdAt: 'desc' },
          include: { officer: { select: { id: true, name: true, role: true } } },
        },
      },
    });

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    return NextResponse.json({ complaint });
  } catch (error) {
    console.error('Fetch complaint error:', error);
    return NextResponse.json({ error: 'Failed to retrieve complaint' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'DEPT_OFFICER') {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 });
    }

    const { id } = params;
    const complaintId = parseInt(id, 10);
    const body = await req.json();

    const validated = complaintUpdateSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid update payload', details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { status, comment } = validated.data;
    const priority = body.priority;
    const departmentId = body.departmentId ? parseInt(body.departmentId, 10) : undefined;
    const officerId = parseInt(session.user.id, 10);

    // Update complaint record
    const updated = await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        status,
        ...(priority ? { priority } : {}),
        ...(departmentId ? { departmentId } : {}),
        updates: {
          create: {
            officerId,
            status,
            comment,
          },
        },
      },
      include: {
        department: true,
        category: true,
        aiAnalysis: true,
        updates: {
          orderBy: { createdAt: 'desc' },
          include: { officer: { select: { id: true, name: true } } },
        },
      },
    });

    return NextResponse.json({
      message: 'Complaint status updated successfully',
      complaint: updated,
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 });
  }
}
