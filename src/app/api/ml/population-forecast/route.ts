import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  forecastApplicationTrend,
  forecastPipelineState,
  getApplicationsByStatus,
  parseSkills,
  calculateApplicationScore,
} from '@/lib/ml-analytics';

/**
 * GET /api/ml/population-forecast
 * Forecast future recruitment "population" trends - similar to population forecasting
 * Predicts hiring volume, pipeline state, and candidate distribution over time
 *
 * Query params:
 *   - months: Number of months to forecast (default: 6, max: 24)
 *   - companyId: Optional filter by company
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const months = Math.min(parseInt(searchParams.get('months') || '6'), 24);
    const companyId = searchParams.get('companyId');

    let query: any = {
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
      orderBy: {
        submittedAt: 'asc' as const,
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
          forecastPeriod: `${months} months`,
          applicationTrend: [],
          pipelineStateForecast: [],
          skillDemandForecast: [],
          anomalyRisk: 'low',
          recommendations: ['Insufficient data for accurate forecasting'],
        },
      });
    }

    // Generate forecasts
    const applicationTrend = forecastApplicationTrend(applications, months);
    const pipelineStateForecast = forecastPipelineState(applications, months);
    
    // Calculate skill demand over time
    const skillDemandByMonth: Record<string, Record<string, number>> = {};
    
    applications.forEach((app) => {
      const date = new Date(app.submittedAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!skillDemandByMonth[monthKey]) {
        skillDemandByMonth[monthKey] = {};
      }
      
      const appWithProposal = app as any;
      const skills = parseSkills(appWithProposal.proposal?.skills || []);
      skills.forEach((skill) => {
        skillDemandByMonth[monthKey][skill] = (skillDemandByMonth[monthKey][skill] || 0) + 1;
      });
    });

    // Calculate candidate quality distribution trend
    const qualityTrend: Record<string, { high: number; medium: number; low: number }> = {};
    const now = new Date();
    
    for (let i = 0; i < months; i++) {
      const futureDate = new Date(now);
      futureDate.setMonth(futureDate.getMonth() + i);
      const monthKey = futureDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });
      
      qualityTrend[monthKey] = { high: 0, medium: 0, low: 0 };
    }

    // Analyze current quality distribution
    const scoredApps = applications.map((app) => ({
      ...app,
      score: calculateApplicationScore(app, 0.7),
    }));

    const highCount = scoredApps.filter((a) => a.score > 0.7).length;
    const mediumCount = scoredApps.filter((a) => a.score >= 0.4 && a.score <= 0.7).length;
    const lowCount = scoredApps.filter((a) => a.score < 0.4).length;

    // Apply slight improvement trend
    const months_arr = Object.keys(qualityTrend);
    months_arr.forEach((_, idx) => {
      const ratio = idx / months;
      qualityTrend[months_arr[idx]].high = Math.round(
        highCount + highCount * ratio * 0.1
      );
      qualityTrend[months_arr[idx]].medium = Math.round(
        mediumCount - mediumCount * ratio * 0.05
      );
      qualityTrend[months_arr[idx]].low = Math.round(
        lowCount - lowCount * ratio * 0.05
      );
    });

    // Identify trends and anomaly risks
    const values = applicationTrend.map((a) => a.predicted);
    const avgApplications = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((sum, v) => sum + Math.pow(v - avgApplications, 2), 0) / values.length;
    const volatility = Math.sqrt(variance);

    let anomalyRisk: 'low' | 'medium' | 'high' = 'low';
    if (volatility > avgApplications * 0.5) {
      anomalyRisk = 'high';
    } else if (volatility > avgApplications * 0.3) {
      anomalyRisk = 'medium';
    }

    // Generate recommendations based on forecast
    const recommendations: string[] = [];

    const trend = applicationTrend[applicationTrend.length - 1]?.predicted - applicationTrend[0]?.predicted;
    if (trend < 0) {
      recommendations.push('Application volume is declining - increase recruitment efforts');
    } else if (trend > 0) {
      recommendations.push('Application volume is increasing - prepare to scale hiring');
    }

    if (anomalyRisk !== 'low') {
      recommendations.push(`${anomalyRisk.toUpperCase()} volatility detected in forecasts - monitor closely`);
    }

    const avgHireRate =
      pipelineStateForecast.reduce((sum, p) => sum + p.predictedHires, 0) /
      pipelineStateForecast.length;
    if (avgHireRate < 1) {
      recommendations.push('Low predicted hiring volume - review pipeline quality');
    }

    // Identify top skills that will remain in demand
    const allSkills: Record<string, number> = {};
    Object.values(skillDemandByMonth).forEach((monthSkills) => {
      Object.entries(monthSkills).forEach(([skill, count]) => {
        allSkills[skill] = (allSkills[skill] || 0) + count;
      });
    });

    const topSkills = Object.entries(allSkills)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill]) => skill);

    return NextResponse.json({
      success: true,
      data: {
        forecastPeriod: `${months} months`,
        applicationTrend: applicationTrend.map((a) => ({
          month: a.month,
          predicted: a.predicted,
          trend: 'linear',
        })),
        pipelineStateForecast: pipelineStateForecast.map((p) => ({
          month: p.month,
          predictedHires: p.predictedHires,
          predictedRejections: p.predictedRejections,
          predictedInProgress: p.predictedInProgress,
          confidence: p.confidence,
        })),
        candidateQualityTrend: Object.entries(qualityTrend).map(([month, counts]) => ({
          month,
          high: counts.high,
          medium: counts.medium,
          low: counts.low,
        })),
        skillDemandForecast: {
          topSkills,
          description: `Top ${topSkills.length} skills in demand over the forecast period`,
        },
        volatilityAnalysis: {
          volatility: Math.round(volatility * 100) / 100,
          anomalyRisk,
          confidence: anomalyRisk === 'high' ? 0.6 : anomalyRisk === 'medium' ? 0.75 : 0.85,
        },
        recommendations: recommendations.slice(0, 5),
        summary: {
          totalApplicationsHistorical: applications.length,
          averageMonthlyApplications: Math.round(avgApplications),
          predictedTotalHires: pipelineStateForecast.reduce((sum, p) => sum + p.predictedHires, 0),
          predictedTotalRejections: pipelineStateForecast.reduce(
            (sum, p) => sum + p.predictedRejections,
            0
          ),
          predictedTotalInProgress: pipelineStateForecast.reduce(
            (sum, p) => sum + p.predictedInProgress,
            0
          ),
        },
      },
    });
  } catch (error) {
    console.error('Population forecast API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate population forecast' },
      { status: 500 }
    );
  }
}
