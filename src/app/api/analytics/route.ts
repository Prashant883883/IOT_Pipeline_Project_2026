import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  forecastApplicationTrend,
  analyzePipelineConversion,
  clusterCandidates,
  detectAnomalies,
  getTrendingSkills,
  calculateRecruitmentHealth,
  calculateConversionRate,
  calculateAverageTimeToHire,
  getSkillsInDemand,
  getApplicationsByStatus,
} from '@/lib/ml-analytics';

export async function GET(request: Request) {
  try {
    const session = await requireAuth();

    // Fetch all applications with related data
    const applications = await prisma.application.findMany({
      where: { companyId: session.companyId },
      include: {
        proposal: {
          select: {
            title: true,
            skills: true,
            student: {
              select: {
                name: true,
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
      orderBy: { submittedAt: 'desc' },
    });

    // Calculate all analytics
    const analytics = {
      // Basic metrics
      totalApplications: applications.length,
      conversionRate: calculateConversionRate(applications),
      avgTimeToHire: calculateAverageTimeToHire(applications),

      // Pipeline analysis
      pipelineConversion: analyzePipelineConversion(applications),

      // Forecasting
      applicationForecast: forecastApplicationTrend(applications, 6),

      // Skills analysis
      skillsInDemand: getSkillsInDemand(applications),
      trendingSkills: getTrendingSkills(applications, 8),

      // Candidate clustering
      candidateClusters: clusterCandidates(applications),

      // Status distribution
      statusDistribution: getApplicationsByStatus(applications),

      // Anomalies
      anomalies: detectAnomalies(applications),

      // Health score
      recruitmentHealth: calculateRecruitmentHealth(applications),

      // Time series data for charts
      timeSeriesData: getApplicationTimeSeriesData(applications),
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to get time-series data for charting
 */
function getApplicationTimeSeriesData(applications: any[]) {
  const monthlyData: Record<string, { submitted: number; selected: number; rejected: number }> = {};

  applications.forEach((app) => {
    const date = new Date(app.submittedAt);
    const key = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });

    if (!monthlyData[key]) {
      monthlyData[key] = { submitted: 0, selected: 0, rejected: 0 };
    }

    monthlyData[key].submitted++;

    if (app.currentStatus === 'SELECTED') {
      monthlyData[key].selected++;
    } else if (app.currentStatus === 'REJECTED') {
      monthlyData[key].rejected++;
    }
  });

  return Object.entries(monthlyData)
    .sort()
    .map(([month, data]) => ({
      month,
      ...data,
    }));
}
