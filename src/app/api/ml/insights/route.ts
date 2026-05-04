import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  calculateAverageTimeToHire,
  calculateConversionRate,
  getSkillsInDemand,
  getTrendingSkills,
  forecastApplicationTrend,
  forecastPipelineState,
  calculateRecruitmentHealth,
  detectAnomalies,
  analyzeSkillDemandIntelligence,
  analyzePipelineConversion,
  clusterCandidates,
} from '@/lib/ml-analytics';

/**
 * GET /api/ml/insights
 * Comprehensive ML-powered recruitment analytics and insights
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    let query: any = {
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
        submittedAt: 'desc' as const,
      },
    };

    if (companyId) {
      query.where = { companyId };
    }

    const applications = await prisma.application.findMany(query);

    if (applications.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          summary: {
            totalApplications: 0,
            conversionRate: 0,
            averageTimeToHire: 0,
            healthScore: 0,
          },
          insights: [],
          recommendations: [],
          skillDemand: [],
          pipelineForecast: [],
          anomalies: [],
        },
      });
    }

    // Calculate all insights
    const conversionRate = calculateConversionRate(applications);
    const avgTimeToHire = calculateAverageTimeToHire(applications);
    const { score: healthScore, factors: healthFactors } = calculateRecruitmentHealth(applications);
    const anomalies = detectAnomalies(applications);
    const skillDemand = analyzeSkillDemandIntelligence(applications);
    const trendingSkills = getTrendingSkills(applications);
    const pipelineForecast = forecastPipelineState(applications, 6);
    const applicationTrend = forecastApplicationTrend(applications, 6);
    const pipelineConversion = analyzePipelineConversion(applications);
    const candidateClusters = clusterCandidates(applications);

    // Generate insights
    const insights = [];

    // Insight 1: Health status
    if (healthScore > 75) {
      insights.push({
        category: 'Health',
        priority: 'positive',
        message: `Recruitment health is excellent (${healthScore}/100). Pipeline is running smoothly.`,
      });
    } else if (healthScore > 50) {
      insights.push({
        category: 'Health',
        priority: 'warning',
        message: `Recruitment health is moderate (${healthScore}/100). Consider optimizing conversion or time-to-hire.`,
      });
    } else {
      insights.push({
        category: 'Health',
        priority: 'alert',
        message: `Recruitment health is low (${healthScore}/100). Immediate action needed to improve pipeline.`,
      });
    }

    // Insight 2: Conversion trends
    if (conversionRate > 0.5) {
      insights.push({
        category: 'Conversion',
        priority: 'positive',
        message: `Strong conversion rate of ${Math.round(conversionRate * 100)}%. Your recruitment process is efficient.`,
      });
    } else if (conversionRate > 0.2) {
      insights.push({
        category: 'Conversion',
        priority: 'neutral',
        message: `Conversion rate is ${Math.round(conversionRate * 100)}%. Industry average is 20-30%.`,
      });
    } else {
      insights.push({
        category: 'Conversion',
        priority: 'alert',
        message: `Low conversion rate of ${Math.round(conversionRate * 100)}%. Focus on moving candidates through stages.`,
      });
    }

    // Insight 3: Time to hire
    if (avgTimeToHire > 0 && avgTimeToHire < 14) {
      insights.push({
        category: 'Speed',
        priority: 'positive',
        message: `Average time-to-hire is ${avgTimeToHire} days. This is faster than industry average.`,
      });
    } else if (avgTimeToHire > 0 && avgTimeToHire > 30) {
      insights.push({
        category: 'Speed',
        priority: 'alert',
        message: `Average time-to-hire is ${avgTimeToHire} days. Consider accelerating your hiring process.`,
      });
    }

    // Insight 4: Skill gaps
    const topMissingSkill = skillDemand.find((s) => s.hiringSuccessRate < 0.3);
    if (topMissingSkill) {
      insights.push({
        category: 'Skills',
        priority: 'warning',
        message: `"${topMissingSkill.skill}" is in demand but candidates lack it. Consider expanding your search or upskilling.`,
      });
    }

    // Recommendations
    const recommendations = [];

    if (conversionRate < 0.3) {
      recommendations.push('Focus on moving more candidates to interview stage');
    }
    if (avgTimeToHire > 20) {
      recommendations.push('Streamline your interview process to reduce time-to-hire');
    }
    if (anomalies.some((a) => a.severity === 'high')) {
      recommendations.push('Address high-severity anomalies in your pipeline');
    }
    if (candidateClusters[0]?.count > 0) {
      recommendations.push(
        `You have ${candidateClusters[0].count} high-performing candidates - prioritize interviews`
      );
    }
    if (trendingSkills.some((s) => s.trend === 'up')) {
      const upSkills = trendingSkills.filter((s) => s.trend === 'up');
      recommendations.push(`Skills on the rise: ${upSkills.map((s) => s.skill).join(', ')}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalApplications: applications.length,
          conversionRate: Math.round(conversionRate * 100),
          averageTimeToHire: avgTimeToHire,
          healthScore,
        },
        insights: insights.slice(0, 5),
        recommendations: recommendations.slice(0, 5),
        skillDemand: skillDemand.slice(0, 10).map((skill) => ({
          skill: skill.skill,
          demandScore: Math.round(skill.demandScore * 100),
          hiringSuccessRate: Math.round(skill.hiringSuccessRate * 100),
          trend: skill.trend,
          averageTimeToHire: skill.averageTimeToHire,
        })),
        trendingSkills: trendingSkills.slice(0, 8).map((skill) => ({
          skill: skill.skill,
          demand: skill.demand,
          trend: skill.trend,
        })),
        pipelineForecast: pipelineForecast.map((f) => ({
          month: f.month,
          predictedHires: f.predictedHires,
          predictedRejections: f.predictedRejections,
          predictedInProgress: f.predictedInProgress,
          confidence: Math.round(f.confidence * 100),
        })),
        applicationTrend: applicationTrend.map((a) => ({
          month: a.month,
          predicted: a.predicted,
        })),
        pipelineConversion: pipelineConversion.map((pc) => ({
          stage: pc.stage,
          count: pc.count,
          percentage: pc.percentage,
          avgTimeInStage: pc.avgTimeInStage,
        })),
        candidateClusters: candidateClusters.map((c) => ({
          cluster: c.cluster,
          count: c.count,
          avgScore: Math.round(c.avgScore * 100),
        })),
        anomalies: anomalies.map((a) => ({
          type: a.anomalyType,
          description: a.description,
          severity: a.severity,
        })),
        healthFactors: healthFactors.map((f) => ({
          name: f.name,
          value: Math.round(f.value),
          weight: f.weight,
        })),
      },
    });
  } catch (error) {
    console.error('Insights API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
