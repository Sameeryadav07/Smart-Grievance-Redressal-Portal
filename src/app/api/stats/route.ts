import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'DEPT_OFFICER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const where: any = {};
    if (session.user.role === 'DEPT_OFFICER' && session.user.departmentId) {
      where.departmentId = session.user.departmentId;
    }

    const [
      totalComplaints,
      submittedCount,
      underReviewCount,
      inProgressCount,
      resolvedCount,
      rejectedCount,
      flaggedCount,
      allComplaints,
      departments,
      categories,
      recentComplaints,
    ] = await Promise.all([
      prisma.complaint.count({ where }),
      prisma.complaint.count({ where: { ...where, status: 'SUBMITTED' } }),
      prisma.complaint.count({ where: { ...where, status: 'UNDER_REVIEW' } }),
      prisma.complaint.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      prisma.complaint.count({ where: { ...where, status: 'RESOLVED' } }),
      prisma.complaint.count({ where: { ...where, status: 'REJECTED' } }),
      prisma.complaint.count({
        where: {
          ...where,
          aiAnalysis: { isFlagged: true },
        },
      }),
      prisma.complaint.findMany({
        where,
        select: {
          id: true,
          status: true,
          departmentId: true,
          categoryId: true,
        },
      }),
      prisma.department.findMany({ select: { id: true, name: true } }),
      prisma.category.findMany({ select: { id: true, name: true } }),
      prisma.complaint.findMany({
        where,
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          department: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
          aiAnalysis: true,
        },
      }),
    ]);

    // Build byDepartment stats
    const deptCountMap: Record<number, number> = {};
    for (const c of allComplaints) {
      if (c.departmentId) {
        deptCountMap[c.departmentId] = (deptCountMap[c.departmentId] || 0) + 1;
      }
    }
    const byDepartment = departments
      .map((d) => ({ name: d.name, count: deptCountMap[d.id] || 0 }))
      .filter((d) => d.count > 0 || session.user.role === 'ADMIN')
      .slice(0, 8);

    // Build byCategory stats
    const catCountMap: Record<number, number> = {};
    for (const c of allComplaints) {
      if (c.categoryId) {
        catCountMap[c.categoryId] = (catCountMap[c.categoryId] || 0) + 1;
      }
    }
    const byCategory = categories
      .map((c) => ({ name: c.name, count: catCountMap[c.id] || 0 }))
      .filter((c) => c.count > 0)
      .slice(0, 8);

    const byStatus = [
      { status: 'SUBMITTED', count: submittedCount },
      { status: 'UNDER_REVIEW', count: underReviewCount },
      { status: 'IN_PROGRESS', count: inProgressCount },
      { status: 'RESOLVED', count: resolvedCount },
      { status: 'REJECTED', count: rejectedCount },
    ];

    return NextResponse.json({
      totalComplaints,
      pendingCount: submittedCount + underReviewCount,
      inProgressCount,
      resolvedCount,
      rejectedCount,
      flaggedCount,
      byCategory,
      byDepartment,
      byStatus,
      recentComplaints,
    });
  } catch (error) {
    console.error('Fetch stats error:', error);
    return NextResponse.json({ error: 'Failed to retrieve stats' }, { status: 500 });
  }
}
