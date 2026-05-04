import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { statusUpdateSchema } from '@/lib/validations';

// PATCH /api/applications/[id]/status - Update application status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const { id } = params;

    const body = await request.json();

    // Validate input
    const result = statusUpdateSchema.safeParse(body);
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

    const { status, notes } = result.data;

    // Verify application belongs to this company
    const application = await prisma.application.findFirst({
      where: {
        id,
        companyId: session.companyId,
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, message: 'Application not found' },
        { status: 404 }
      );
    }

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        currentStatus: status,
        updatedAt: new Date(),
      },
    });

    // Create status history entry
    await prisma.statusHistory.create({
      data: {
        applicationId: id,
        status,
        changedBy: session.companyId,
        notes: notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Status updated successfully',
      data: { application: updatedApplication },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    console.error('Update status error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
