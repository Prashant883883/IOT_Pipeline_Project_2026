import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { recruiterNoteSchema } from '@/lib/validations';

// POST /api/recruiter-notes - Create a new note
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    // Validate input
    const result = recruiterNoteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors: result.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { content, applicationId } = body as { content: string; applicationId: string };

    // Verify application belongs to this company
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        companyId: session.companyId,
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, message: 'Application not found' },
        { status: 404 }
      );
    }

    // Create note
    const note = await prisma.recruiterNote.create({
      data: {
        content,
        applicationId,
        companyId: session.companyId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Note created successfully',
      data: { note },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    console.error('Create note error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
