import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { proposalFiltersSchema } from '@/lib/validations';
import { PAGINATION, ALL_STATUSES } from '@/lib/constants';
import { safeJsonParse } from '@/lib/utils';

// GET /api/proposals - List proposals with filters
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const filters = {
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined,
      sortBy: (searchParams.get('sortBy') as 'submittedAt' | 'studentName' | 'title') || 'submittedAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || String(PAGINATION.DEFAULT_LIMIT), 10),
    };

    // Validate filters
    const result = proposalFiltersSchema.safeParse(filters);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid filters', errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { search, status, sortBy, sortOrder, page, limit } = result.data;

    // Build where clause
    const where: Record<string, unknown> = {
      companyId: session.companyId,
    };

    if (status) {
      where.currentStatus = status;
    }

    if (search) {
      where.OR = [
        { proposal: { title: { contains: search, mode: 'insensitive' } } },
        { proposal: { summary: { contains: search, mode: 'insensitive' } } },
        { proposal: { student: { name: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    // Build order by
    const orderBy: any = {};
    if (sortBy === 'studentName') {
      orderBy.student = { name: sortOrder };
    } else if (sortBy === 'title') {
      orderBy.proposal = { title: sortOrder };
    } else {
      orderBy.submittedAt = sortOrder;
    }

    // Get total count
    const totalCount = await prisma.application.count({ where });

    // Get applications with related data
    const applications = await prisma.application.findMany({
      where,
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
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    // Parse JSON skills
    const formattedApplications = applications.map((app) => ({
      ...app,
      proposal: {
        ...app.proposal,
        skills: safeJsonParse<string[]>(app.proposal.skills, []),
        student: app.proposal.student ? {
          ...app.proposal.student,
          skills: safeJsonParse<string[]>(app.proposal.student.skills, []),
        } : null,
      },
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        applications: formattedApplications,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    console.error('Get proposals error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
