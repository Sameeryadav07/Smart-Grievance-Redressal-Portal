import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { complaintSubmitSchema } from '@/schemas/complaint';
import { generateTrackingId } from '@/lib/utils';
import { analyzeComplaint } from '@/lib/ai';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '10', 10));
    const skip = (page - 1) * limit;

    const status = searchParams.get('status');
    const categoryId = searchParams.get('categoryId');
    const departmentId = searchParams.get('departmentId');
    const isFlagged = searchParams.get('isFlagged');
    const search = searchParams.get('search');
    const myOnly = searchParams.get('my') === 'true';

    const where: any = {};

    // Citizen can view their own complaints
    if (myOnly) {
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      where.userId = parseInt(session.user.id, 10);
    } else if (session?.user?.role === 'DEPT_OFFICER' && session.user.departmentId) {
      // Dept officers see their department by default unless explicitly filtering
      where.departmentId = session.user.departmentId;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (categoryId && categoryId !== 'ALL') {
      where.categoryId = parseInt(categoryId, 10);
    }

    if (departmentId && departmentId !== 'ALL') {
      where.departmentId = parseInt(departmentId, 10);
    }

    if (isFlagged === 'true') {
      where.aiAnalysis = { isFlagged: true };
    }

    if (search && search.trim()) {
      where.OR = [
        { trackingId: { contains: search.trim() } },
        { title: { contains: search.trim() } },
        { description: { contains: search.trim() } },
        { locationAddress: { contains: search.trim() } },
      ];
    }

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          department: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
          aiAnalysis: true,
          updates: {
            orderBy: { createdAt: 'desc' },
            include: { officer: { select: { id: true, name: true } } },
          },
        },
      }),
      prisma.complaint.count({ where }),
    ]);

    return NextResponse.json({
      complaints,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return NextResponse.json({ error: 'Failed to retrieve complaints' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const validated = complaintSubmitSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, description, categoryId, locationLat, locationLng, locationAddress } = validated.data;
    let savedImagePath: string | null = null;

    // Handle optional base64 image
    if (body.imageBase64 && typeof body.imageBase64 === 'string') {
      const matches = body.imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `complaint_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const fullFilePath = path.join(uploadsDir, filename);
        fs.writeFileSync(fullFilePath, buffer);
        savedImagePath = `/uploads/${filename}`;
      }
    }

    const trackingId = generateTrackingId();
    const userId = parseInt(session.user.id, 10);

    const complaint = await prisma.complaint.create({
      data: {
        trackingId,
        title,
        description,
        categoryId: categoryId || undefined,
        locationLat: locationLat || undefined,
        locationLng: locationLng || undefined,
        locationAddress: locationAddress || undefined,
        imagePath: savedImagePath,
        userId,
        status: 'SUBMITTED',
        priority: 'MEDIUM',
      },
      include: {
        department: true,
        category: true,
      },
    });

    // Run AI analysis asynchronously (non-blocking)
    analyzeComplaint(
      complaint.id,
      title,
      description,
      savedImagePath,
      locationLat || null,
      locationLng || null
    ).catch((aiErr) => console.error('AI pipeline error for complaint', complaint.id, aiErr));

    return NextResponse.json(
      {
        message: 'Complaint submitted successfully',
        trackingId: complaint.trackingId,
        complaintId: complaint.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Complaint creation error:', error);
    return NextResponse.json({ error: 'Failed to submit grievance' }, { status: 500 });
  }
}
