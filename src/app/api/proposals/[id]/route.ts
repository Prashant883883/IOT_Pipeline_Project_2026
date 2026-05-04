import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { safeJsonParse } from '@/lib/utils';

// GET /api/proposals/[id] - Get single proposal with details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const { id } = params;

    const application = await prisma.application.findFirst({
      where: {
        id,
        companyId: session.companyId,
      },
      include: {
        proposal: {
          include: {
            student: true,
          },
        },
        statusHistory: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        recruiterNotes: {
          where: {
            companyId: session.companyId,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, message: 'Application not found' },
        { status: 404 }
      );
    }

    // Parse JSON skills
    const formattedApplication = {
      ...application,
      proposal: {
        ...application.proposal,
        skills: safeJsonParse<string[]>(application.proposal.skills, []),
        student: {
          ...application.proposal.student,
          skills: safeJsonParse<string[]>(application.proposal.student.skills, []),
        },
      },
    };

    return NextResponse.json({
      success: true,
      data: { application: formattedApplication },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    console.error('Get proposal error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
