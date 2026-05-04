import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  calculateSkillsMatch,
  calculateApplicationScore,
  parseSkills,
  calculateAverageTimeToHire,
  calculateConversionRate,
  getSkillsInDemand,
  getApplicationsByStatus,
} from '@/lib/ml-analytics';

export async function GET(request: NextRequest) {
  try {
    // Fetch all applications with related data
    const applications = await prisma.application.findMany({
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
        submittedAt: 'desc',
      },
    });

    if (applications.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          topCandidates: [],
          averageMatchScore: 0,
          totalApplications: 0,
          hireConversionRate: 0,
          skillsInDemand: [],
          applicationsByStatus: [],
          averageTimeToHire: 0,
        },
      });
    }

    // Score each application
    const scoredApplications = applications.map((app) => {
      const studentSkills = parseSkills(app.proposal.student?.skills || []);
      const proposalSkills = parseSkills(app.proposal.skills || []);

      const skillsMatch = calculateSkillsMatch(studentSkills, proposalSkills);
      const applicationScore = calculateApplicationScore(app, skillsMatch.score);

      return {
        id: app.id,
        proposalId: app.proposal.id,
        proposalTitle: app.proposal.title,
        studentName: app.proposal.student?.name || 'Unknown',
        studentEmail: app.proposal.student?.email || '',
        studentSkills,
        proposalSkills,
        matchScore: applicationScore,
        skillsGap: skillsMatch.gap,
        status: app.currentStatus,
        submittedAt: app.submittedAt,
      };
    });

    // Sort by match score and get top candidates
    const topCandidates = scoredApplications
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    // Calculate metrics
    const averageMatchScore =
      scoredApplications.reduce((sum, app) => sum + app.matchScore, 0) /
      scoredApplications.length;

    const hireConversionRate = calculateConversionRate(applications);
    const averageTimeToHire = calculateAverageTimeToHire(applications);
    const skillsInDemand = getSkillsInDemand(applications);
    const applicationsByStatus = getApplicationsByStatus(applications);

    return NextResponse.json({
      success: true,
      data: {
        topCandidates,
        averageMatchScore,
        totalApplications: applications.length,
        hireConversionRate,
        skillsInDemand,
        applicationsByStatus,
        averageTimeToHire,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate analytics' },
      { status: 500 }
    );
  }
}
