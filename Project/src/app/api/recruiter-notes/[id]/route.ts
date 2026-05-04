import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { recruiterNoteSchema } from '@/lib/validations';

// PATCH /api/recruiter-notes/[id] - Update a note
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const { id } = params;

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

    const { content } = result.data;

    // Verify note belongs to this company
    const existingNote = await prisma.recruiterNote.findFirst({
      where: {
        id,
        companyId: session.companyId,
      },
    });

    if (!existingNote) {
      return NextResponse.json(
        { success: false, message: 'Note not found' },
        { status: 404 }
      );
    }

    // Update note
    const note = await prisma.recruiterNote.update({
      where: { id },
      data: {
        content,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Note updated successfully',
      data: { note },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    console.error('Update note error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

// DELETE /api/recruiter-notes/[id] - Delete a note
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const { id } = params;

    // Verify note belongs to this company
    const existingNote = await prisma.recruiterNote.findFirst({
      where: {
        id,
        companyId: session.companyId,
      },
    });

    if (!existingNote) {
      return NextResponse.json(
        { success: false, message: 'Note not found' },
        { status: 404 }
      );
    }

    // Delete note
    await prisma.recruiterNote.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    console.error('Delete note error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
