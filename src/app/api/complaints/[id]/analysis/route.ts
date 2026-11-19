import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { analyzeComplaint } from '@/lib/ai';

interface RouteParams {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const complaintId = parseInt(params.id, 10);
    const analysis = await prisma.aIAnalysis.findUnique({
      where: { complaintId },
      include: {
        complaint: {
          select: {
            id: true,
            trackingId: true,
            title: true,
            status: true,
            imagePath: true,
          },
        },
      },
    });

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    let parsedDuplicates: any[] = [];
    let parsedMetadataFlags: string[] = [];
    try {
      parsedMetadataFlags = JSON.parse(analysis.metadataFlags || '[]');
      if (analysis.analysisData) {
        const fullData = JSON.parse(analysis.analysisData);
        parsedDuplicates = fullData.duplicates || [];
      }
    } catch (e) {
      // json parse fallback
    }

    return NextResponse.json({
      analysis: {
        ...analysis,
        metadataFlags: parsedMetadataFlags,
        duplicates: parsedDuplicates,
      },
    });
  } catch (error) {
    console.error('Fetch analysis error:', error);
    return NextResponse.json({ error: 'Failed to retrieve analysis' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required to re-run AI analysis' }, { status: 403 });
    }

    const complaintId = parseInt(params.id, 10);
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
    });

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const result = await analyzeComplaint(
      complaint.id,
      complaint.title,
      complaint.description,
      complaint.imagePath,
      complaint.locationLat,
      complaint.locationLng
    );

    return NextResponse.json({
      message: 'AI Analysis re-executed successfully',
      result,
    });
  } catch (error) {
    console.error('Re-run analysis error:', error);
    return NextResponse.json({ error: 'Failed to re-run analysis' }, { status: 500 });
  }
}
