import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { advancedSkillMatch, parseSkills } from '@/lib/ml-analytics';

/**
 * GET /api/ml/advanced-matching
 * Detailed skill matching between student and proposal
 * Provides comprehensive analysis with exact matches, partial matches, and gaps
 *
 * Query params:
 *   - studentId: Student to match
 *   - proposalId: Proposal to match against
 *   - OR
 *   - studentSkills: Comma-separated skills from student
 *   - proposalSkills: Comma-separated required skills
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const proposalId = searchParams.get('proposalId');
    const studentSkillsParam = searchParams.get('studentSkills');
    const proposalSkillsParam = searchParams.get('proposalSkills');

    if (!studentId && !studentSkillsParam) {
      return NextResponse.json(
        {
          error: 'Either studentId with proposalId, or studentSkills with proposalSkills is required',
        },
        { status: 400 }
      );
    }

    let studentSkills: string[] = [];
    let proposalSkills: string[] = [];
    let studentName = 'Unknown';
    let proposalTitle = 'Unknown';

    // Method 1: Using IDs from database
    if (studentId && proposalId) {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
      });

      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
      });

      if (!student || !proposal) {
        return NextResponse.json(
          { error: 'Student or proposal not found' },
          { status: 404 }
        );
      }

      studentSkills = parseSkills(student.skills || []);
      proposalSkills = parseSkills(proposal.skills || []);
      studentName = student.name;
      proposalTitle = proposal.title;
    }
    // Method 2: Using direct skill strings
    else if (studentSkillsParam && proposalSkillsParam) {
      studentSkills = parseSkills(studentSkillsParam);
      proposalSkills = parseSkills(proposalSkillsParam);
      studentName = 'Query Student';
      proposalTitle = 'Query Proposal';
    }
    // Invalid combination
    else if ((studentId && !proposalId) || (!studentId && proposalId)) {
      return NextResponse.json(
        { error: 'Both studentId and proposalId are required when using IDs' },
        { status: 400 }
      );
    } else if ((studentSkillsParam && !proposalSkillsParam) || (!studentSkillsParam && proposalSkillsParam)) {
      return NextResponse.json(
        { error: 'Both studentSkills and proposalSkills are required when using skill strings' },
        { status: 400 }
      );
    }

    // Perform advanced matching
    const matchResult = advancedSkillMatch(studentSkills, proposalSkills);

    // Calculate additional metrics
    const totalRequiredSkills = proposalSkills.length;
    const matchedSkills = matchResult.exactMatches.length + matchResult.partialMatches.length;
    const gapCount = matchResult.missingSkills.length;

    // Determine recommendation
    let recommendation = 'No recommendation';
    let recommendationLevel: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';

    if (matchResult.matchPercentage >= 90) {
      recommendation = '✅ Excellent match - highly recommended for interview';
      recommendationLevel = 'excellent';
    } else if (matchResult.matchPercentage >= 70) {
      recommendation = '👍 Good match - recommended for interview';
      recommendationLevel = 'good';
    } else if (matchResult.matchPercentage >= 50) {
      recommendation = '⚠️ Fair match - consider for development or junior role';
      recommendationLevel = 'fair';
    } else {
      recommendation = '❌ Poor match - significant skill gaps';
      recommendationLevel = 'poor';
    }

    // Learning path recommendations
    const learningPath = matchResult.missingSkills.slice(0, 3).map((skill) => ({
      skill,
      priority: 'high',
      timeEstimate: '4-8 weeks',
      resources: [
        `Learn ${skill} through online courses`,
        `Practice ${skill} in project-based assignments`,
      ],
    }));

    // Similar roles recommendation based on skills
    const studentSkillSet = new Set(studentSkills);
    const proposalSkillSet = new Set(proposalSkills);
    const overlapPercentage = (
      (matchResult.exactMatches.length + matchResult.partialMatches.length) /
      Math.max(studentSkillSet.size, proposalSkillSet.size)
    ) * 100;

    return NextResponse.json({
      success: true,
      data: {
        studentName,
        proposalTitle,
        matchingAnalysis: {
          overallScore: Math.round(matchResult.overallScore * 100),
          matchPercentage: matchResult.matchPercentage,
          exactMatchCount: matchResult.exactMatches.length,
          partialMatchCount: matchResult.partialMatches.length,
          missingSkillCount: matchResult.missingSkills.length,
          totalRequiredSkills,
          matchedSkills,
          gapCount,
        },
        detailedBreakdown: {
          exactMatches: matchResult.exactMatches.map((skill) => ({
            skill,
            type: 'exact',
            confidence: 100,
          })),
          partialMatches: matchResult.partialMatches.map((match) => ({
            requiredSkill: match.skill,
            candidateSkill: match.match,
            similarity: Math.round(match.similarity * 100),
            type: 'partial',
          })),
          missingSkills: matchResult.missingSkills.map((skill) => ({
            skill,
            type: 'missing',
            importance: 'high',
          })),
        },
        recommendation: {
          level: recommendationLevel,
          message: recommendation,
          actionItems: [
            matchResult.exactMatches.length > 0
              ? `${matchResult.exactMatches.length} skills already match requirements`
              : 'No exact skill matches found',
            matchResult.partialMatches.length > 0
              ? `${matchResult.partialMatches.length} skills are similar to requirements`
              : 'No partial matches found',
            matchResult.missingSkills.length > 0
              ? `${matchResult.missingSkills.length} skills need to be developed`
              : 'No skill gaps identified',
          ],
        },
        learningPath:
          matchResult.missingSkills.length > 0
            ? {
                skillsToLearn: learningPath,
                estimatedTimeToHire: `${matchResult.missingSkills.length * 4}-${matchResult.missingSkills.length * 8} weeks`,
                description: 'Recommended learning path to bridge skill gaps',
              }
            : null,
        metrics: {
          skillOverlapPercentage: Math.round(overlapPercentage),
          candidateBreadth: studentSkills.length,
          roleDepth: proposalSkills.length,
          readyToHire: matchResult.matchPercentage >= 70,
          developmentPotential: matchResult.matchPercentage >= 40 && matchResult.matchPercentage < 70,
        },
        alternativeRoles:
          overlapPercentage >= 50
            ? [
                {
                  description: 'Junior role with mentoring',
                  requiredSkills: matchResult.exactMatches.slice(0, 3),
                  timeToProductivity: '2-4 weeks',
                },
                {
                  description: 'Related role leveraging current skills',
                  requiredSkills: matchResult.exactMatches,
                  timeToProductivity: '1 week',
                },
              ]
            : [],
      },
    });
  } catch (error) {
    console.error('Advanced matching API error:', error);
    return NextResponse.json(
      { error: 'Failed to perform advanced matching' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ml/advanced-matching
 * Batch matching for multiple student-proposal pairs
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pairs } = body;

    if (!Array.isArray(pairs) || pairs.length === 0) {
      return NextResponse.json(
        { error: 'Pairs array is required' },
        { status: 400 }
      );
    }

    if (pairs.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 pairs per request' },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      pairs.map(async (pair) => {
        const { studentSkills, proposalSkills, studentId, proposalId } = pair;

        try {
          let studentSkillsArray: string[] = [];
          let proposalSkillsArray: string[] = [];

          if (studentSkills && proposalSkills) {
            studentSkillsArray = parseSkills(studentSkills);
            proposalSkillsArray = parseSkills(proposalSkills);
          } else if (studentId && proposalId) {
            const student = await prisma.student.findUnique({
              where: { id: studentId },
            });
            const proposal = await prisma.proposal.findUnique({
              where: { id: proposalId },
            });

            if (student && proposal) {
              studentSkillsArray = parseSkills(student.skills || []);
              proposalSkillsArray = parseSkills(proposal.skills || []);
            }
          }

          const match = advancedSkillMatch(studentSkillsArray, proposalSkillsArray);

          return {
            studentId: studentId || 'manual',
            proposalId: proposalId || 'manual',
            matchPercentage: match.matchPercentage,
            overallScore: Math.round(match.overallScore * 100),
            exactMatches: match.exactMatches.length,
            partialMatches: match.partialMatches.length,
            gaps: match.missingSkills.length,
          };
        } catch (error) {
          return {
            studentId: studentId || 'manual',
            proposalId: proposalId || 'manual',
            error: 'Failed to process pair',
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        totalPairs: results.length,
        results: results.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0)),
        summary: {
          excellentMatches: results.filter((r) => (r.matchPercentage || 0) >= 90).length,
          goodMatches: results.filter(
            (r) => (r.matchPercentage || 0) >= 70 && (r.matchPercentage || 0) < 90
          ).length,
          fairMatches: results.filter(
            (r) => (r.matchPercentage || 0) >= 50 && (r.matchPercentage || 0) < 70
          ).length,
          poorMatches: results.filter((r) => (r.matchPercentage || 0) < 50).length,
        },
      },
    });
  } catch (error) {
    console.error('Batch matching API error:', error);
    return NextResponse.json(
      { error: 'Failed to perform batch matching' },
      { status: 500 }
    );
  }
}
