import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  parseSkills,
  recommendCandidatesForProposal,
  findSimilarCandidates,
} from '@/lib/ml-analytics';

/**
 * GET /api/ml/recommendations
 * Query params:
 *   - proposalId: Get recommendations for a specific proposal
 *   - candidateId: Find similar candidates
 *   - limit: Number of recommendations (default: 5)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get('proposalId');
    const candidateId = searchParams.get('candidateId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 20);

    if (!proposalId && !candidateId) {
      return NextResponse.json(
        {
          error: 'Either proposalId or candidateId is required',
        },
        { status: 400 }
      );
    }

    // Fetch all applications with related data
    const allApplications = await prisma.application.findMany({
      include: {
        proposal: {
          include: {
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

    if (proposalId) {
      // Get recommendations for a proposal
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
      });

      if (!proposal) {
        return NextResponse.json(
          { error: 'Proposal not found' },
          { status: 404 }
        );
      }

      const proposalSkills = parseSkills(proposal.skills);

      const recommendations = recommendCandidatesForProposal(
        proposalId,
        proposalSkills,
        allApplications,
        limit
      );

      return NextResponse.json({
        success: true,
        data: {
          proposalId,
          proposalTitle: proposal.title,
          recommendations: recommendations.map((rec) => ({
            candidateId: rec.candidateId,
            recommendationScore: Math.round(rec.recommendationScore * 100),
            matchDetails: {
              skillMatchScore: Math.round(rec.matchDetails.skillMatchScore * 100),
              experienceScore: Math.round(rec.matchDetails.experienceScore * 100),
              successProbability: Math.round(rec.matchDetails.successProbability * 100),
              recommendationReason: rec.matchDetails.recommendationReason,
            },
            strengths: rec.strengths,
            gaps: rec.gaps,
          })),
        },
      });
    }

    if (candidateId) {
      // Find similar candidates
      const similarities = findSimilarCandidates(
        candidateId,
        allApplications,
        0.6
      );

      return NextResponse.json({
        success: true,
        data: {
          targetCandidateId: candidateId,
          similarCandidates: similarities.map((sim) => ({
            candidateId: sim.candidateId,
            similarity: Math.round(sim.similarity * 100),
            commonSkills: sim.commonSkills,
            complementarySkills: sim.complementarySkills,
          })),
        },
      });
    }
  } catch (error) {
    console.error('Recommendations API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
