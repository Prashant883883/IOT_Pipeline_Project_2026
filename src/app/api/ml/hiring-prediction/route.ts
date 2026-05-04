import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { predictHiringSuccess } from '@/lib/ml-analytics';

/**
 * GET /api/ml/hiring-prediction
 * Query params:
 *   - applicationId: Predict success for a specific application
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');

    if (!applicationId) {
      return NextResponse.json(
        { error: 'applicationId is required' },
        { status: 400 }
      );
    }

    // Fetch the specific application
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        proposal: {
          select: {
            id: true,
            title: true,
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
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Fetch all applications for context
    const allApplications = await prisma.application.findMany({
      include: {
        proposal: {
          select: {
            id: true,
            title: true,
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
    });

    const prediction = predictHiringSuccess(application, allApplications);

    return NextResponse.json({
      success: true,
      data: {
        applicationId,
        studentName: application.proposal?.student?.name,
        proposalTitle: application.proposal?.title,
        successProbability: Math.round(prediction.successProbability * 100),
        confidenceLevel: prediction.confidenceLevel,
        recommendation: prediction.recommendation,
        keyFactors: prediction.keyFactors.map((f) => ({
          factor: f.factor,
          impact: Math.round(f.impact * 100),
          direction: f.direction,
        })),
      },
    });
  } catch (error) {
    console.error('Hiring prediction API error:', error);
    return NextResponse.json(
      { error: 'Failed to predict hiring success' },
      { status: 500 }
    );
  }
}
