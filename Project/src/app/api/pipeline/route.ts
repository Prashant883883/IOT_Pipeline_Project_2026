import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { PIPELINE_COLUMNS } from '@/lib/constants';
import { safeJsonParse } from '@/lib/utils';

// GET /api/pipeline - Get pipeline data grouped by status
export async function GET() {
  try {
    const session = await requireAuth();

    // Get all applications for this company
    const applications = await prisma.application.findMany({
      where: {
        companyId: session.companyId,
      },
      include: {
        proposal: {
          select: {
            id: true,
            title: true,
            summary: true,
            skills: true,
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                skills: true,
              },
            },
          },
        },
        _count: {
          select: {
            recruiterNotes: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Group by status
    const pipeline = PIPELINE_COLUMNS.map((status) => {
      const statusApps = applications.filter((app) => app.currentStatus === status);
      
      return {
        status,
        count: statusApps.length,
        applications: statusApps.map((app) => ({
          ...app,
          proposal: {
            ...app.proposal,
            skills: safeJsonParse<string[]>(app.proposal.skills, []),
          },
          student: app.proposal.student ? {
            ...app.proposal.student,
            skills: safeJsonParse<string[]>(app.proposal.student.skills, []),
          } : undefined,
        })),
      };
    });

    // Add rejected column (not in main pipeline flow)
    const rejectedApps = applications.filter((app) => app.currentStatus === 'REJECTED');
    pipeline.push({
      status: 'REJECTED',
      count: rejectedApps.length,
      applications: rejectedApps.map((app) => ({
        ...app,
        proposal: {
          ...app.proposal,
          skills: safeJsonParse<string[]>(app.proposal.skills, []),
        },
        student: app.proposal.student ? {
          ...app.proposal.student,
          skills: safeJsonParse<string[]>(app.proposal.student.skills, []),
        } : undefined,
      })),
    });

    return NextResponse.json({
      success: true,
      data: { pipeline },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    console.error('Get pipeline error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
