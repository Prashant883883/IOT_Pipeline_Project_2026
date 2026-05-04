'use client';

import { useEffect, useState } from 'react';
import { BarChart, LineChart, PieChart, StatCard } from '@/components/Charts';

interface InsightData {
  summary: {
    totalApplications: number;
    conversionRate: number;
    averageTimeToHire: number;
    healthScore: number;
  };
  insights: Array<{
    category: string;
    priority: string;
    message: string;
  }>;
  recommendations: string[];
  skillDemand: Array<{
    skill: string;
    demandScore: number;
    hiringSuccessRate: number;
    trend: string;
    averageTimeToHire: number;
  }>;
  trendingSkills: Array<{
    skill: string;
    demand: number;
    trend: string;
  }>;
  pipelineForecast: Array<{
    month: string;
    predictedHires: number;
    predictedRejections: number;
    predictedInProgress: number;
    confidence: number;
  }>;
  applicationTrend: Array<{
    month: string;
    predicted: number;
  }>;
  pipelineConversion: Array<{
    stage: string;
    count: number;
    percentage: number;
    avgTimeInStage: number;
  }>;
  candidateClusters: Array<{
    cluster: string;
    count: number;
    avgScore: number;
  }>;
  anomalies: Array<{
    type: string;
    description: string;
    severity: string;
  }>;
  healthFactors: Array<{
    name: string;
    value: number;
    weight: number;
  }>;
}

export default function MLInsightsPage() {
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const response = await fetch('/api/ml/insights');
        if (!response.ok) throw new Error('Failed to fetch ML insights');
        const insightsData = await response.json();
        setData(insightsData.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          <p className="mt-4 text-gray-600">Loading ML insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-lg font-semibold text-red-900">Error</h2>
        <p className="text-red-700 mt-1">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-600">No ML insights available yet</p>
      </div>
    );
  }

  const healthColor =
    data.summary.healthScore >= 75
      ? 'green'
      : data.summary.healthScore >= 50
        ? 'yellow'
        : 'red';

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'positive':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'alert':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-900';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-900';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ML-Powered Insights</h1>
        <p className="text-gray-600 mt-1">
          Advanced analytics and predictions powered by machine learning
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Applications"
          value={data.summary.totalApplications}
          color="blue"
        />
        <StatCard
          title="Conversion Rate"
          value={`${data.summary.conversionRate}%`}
          color="green"
        />
        <StatCard
          title="Avg Time to Hire"
          value={`${data.summary.averageTimeToHire}d`}
          color="purple"
        />
        <StatCard
          title="Health Score"
          value={`${data.summary.healthScore}/100`}
          color={healthColor === 'green' ? 'green' : healthColor === 'yellow' ? 'purple' : 'red'}
        />
      </div>

      {/* AI Insights */}
      {data.insights.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">💡 AI Insights</h2>
          <div className="space-y-3">
            {data.insights.map((insight, idx) => (
              <div
                key={idx}
                className={`p-4 rounded border ${getPriorityColor(insight.priority)}`}
              >
                <p className="font-semibold">{insight.category}</p>
                <p className="text-sm mt-1">{insight.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🎯 Recommendations</h2>
          <ul className="space-y-2">
            {data.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-blue-600 mr-3 font-bold">→</span>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Anomalies */}
      {data.anomalies.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">⚠️ Anomalies</h2>
          <div className="space-y-3">
            {data.anomalies.map((anomaly, idx) => (
              <div key={idx} className={`p-4 rounded border ${getSeverityColor(anomaly.severity)}`}>
                <p className="font-semibold">{anomaly.type}</p>
                <p className="text-sm mt-1">{anomaly.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Trend */}
        {data.applicationTrend.length > 0 && (
          <LineChart
            title="Application Forecast (6 Months)"
            data={data.applicationTrend.map((point) => ({
              x: point.month,
              y: point.predicted,
            }))}
          />
        )}

        {/* Pipeline Forecast */}
        {data.pipelineForecast.length > 0 && (
          <BarChart
            title="Pipeline Forecast (6 Months)"
            data={data.pipelineForecast.slice(0, 6).map((point) => ({
              label: point.month,
              value: point.predictedHires,
            }))}
            color="green"
          />
        )}

        {/* Candidate Clusters */}
        {data.candidateClusters.length > 0 && (
          <BarChart
            title="Candidate Distribution by Performance"
            data={data.candidateClusters.map((cluster) => ({
              label: cluster.cluster,
              value: cluster.count,
            }))}
            color="blue"
          />
        )}

        {/* Pipeline Conversion Funnel */}
        {data.pipelineConversion.length > 0 && (
          <BarChart
            title="Pipeline Stages"
            data={data.pipelineConversion.map((stage) => ({
              label: stage.stage,
              value: stage.count,
            }))}
            color="purple"
          />
        )}
      </div>

      {/* Skill Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Skills in Demand */}
        {data.skillDemand.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📊 Skills Analysis
            </h3>
            <div className="space-y-3">
              {data.skillDemand.slice(0, 8).map((skill, idx) => (
                <div key={idx} className="flex items-between justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{skill.skill}</p>
                    <div className="mt-1 flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600"
                          style={{ width: `${skill.demandScore}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{skill.demandScore}%</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Success Rate: {skill.hiringSuccessRate}% | Trend:{' '}
                      {skill.trend === 'up' ? '📈' : skill.trend === 'down' ? '📉' : '→'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trending Skills */}
        {data.trendingSkills.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🔥 Trending Skills
            </h3>
            <div className="space-y-2">
              {data.trendingSkills.map((skill, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <div>
                    <p className="font-medium text-gray-900">{skill.skill}</p>
                    <p className="text-xs text-gray-500">Demand: {skill.demand}</p>
                  </div>
                  <span className="text-lg">
                    {skill.trend === 'up' ? '📈' : skill.trend === 'down' ? '📉' : '→'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Health Factors Breakdown */}
      {data.healthFactors.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📈 Health Score Breakdown
          </h3>
          <div className="space-y-4">
            {data.healthFactors.map((factor, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-1">
                  <p className="font-medium text-gray-900">{factor.name}</p>
                  <p className="text-sm text-gray-600">{factor.value}/100</p>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                    style={{ width: `${factor.value}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Weight: {factor.weight}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
