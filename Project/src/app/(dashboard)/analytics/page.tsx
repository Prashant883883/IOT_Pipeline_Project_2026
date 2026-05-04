'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  LineChart,
  PieChart,
  StatCard,
  TrendIndicator,
} from '@/components/Charts';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch('/api/analytics');
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          <p className="mt-4 text-gray-600">Loading analytics...</p>
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
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  const healthScore = data.recruitmentHealth?.score || 0;
  const healthColor = healthScore >= 75 ? 'green' : healthScore >= 50 ? 'yellow' : 'red';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">
          ML-driven insights for your recruitment pipeline
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Applications"
          value={data.totalApplications}
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 1 1 0 000 2H6a1 1 0 100-2h-.5A2.5 2.5 0 013 7.5V17a2 2 0 002 2h10a2 2 0 002-2v-9.5A2.5 2.5 0 0012 5h-.5a1 1 0 000 2H12a1 1 0 100-2h-2a1 1 0 100 2H9a1 1 0 000-2H8.5A2.5 2.5 0 006 5H4z"
                clipRule="evenodd"
              />
            </svg>
          }
          color="blue"
        />
        <StatCard
          title="Conversion Rate"
          value={`${Math.round(data.conversionRate * 100)}%`}
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V9.414l-4.293 4.293a1 1 0 01-1.414-1.414L13.586 8H12z"
                clipRule="evenodd"
              />
              <path
                fillRule="evenodd"
                d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a1 1 0 10-2 0v8H5V5h4a1 1 0 000-2H5z"
                clipRule="evenodd"
              />
            </svg>
          }
          color="green"
        />
        <StatCard
          title="Avg Time to Hire"
          value={`${data.avgTimeToHire} days`}
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                clipRule="evenodd"
              />
            </svg>
          }
          color="purple"
        />
        <StatCard
          title="Health Score"
          value={`${healthScore}/100`}
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-2.723 3.066 3.066 0 10-3.58 3.03 6.124 6.124 0 014.01 4.864l-3.732 2.313a6.124 6.124 0 01-2.93-4.72 3.066 3.066 0 00-3.657 3.069 3.066 3.066 0 001.745 2.723 6.124 6.124 0 002.772 6.972 5.823 5.823 0 003.806 1.352 5.823 5.823 0 005.745-7.098 6.124 6.124 0 002.772-6.972 3.066 3.066 0 001.745-2.723 3.066 3.066 0 10-3.58-3.03 6.124 6.124 0 01-4.01 4.864l3.732 2.313a6.124 6.124 0 012.93 4.72 3.066 3.066 0 003.657-3.069 3.066 3.066 0 00-1.745-2.723 6.124 6.124 0 00-2.772-6.972A5.823 5.823 0 006.267 3.455z"
                clipRule="evenodd"
              />
            </svg>
          }
          color={healthColor === 'green' ? 'green' : 'purple'}
        />
      </div>

      {/* Anomalies Alert */}
      {data.anomalies && data.anomalies.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-4">
            🔔 Anomalies Detected
          </h3>
          <div className="space-y-3">
            {data.anomalies.map((anomaly: any, index: number) => (
              <div
                key={index}
                className={`p-3 rounded ${
                  anomaly.severity === 'high'
                    ? 'bg-red-50 border border-red-200'
                    : anomaly.severity === 'medium'
                      ? 'bg-yellow-50 border border-yellow-200'
                      : 'bg-blue-50 border border-blue-200'
                }`}
              >
                <p
                  className={`font-semibold ${
                    anomaly.severity === 'high'
                      ? 'text-red-900'
                      : anomaly.severity === 'medium'
                        ? 'text-yellow-900'
                        : 'text-blue-900'
                  }`}
                >
                  {anomaly.anomalyType}
                </p>
                <p
                  className={`text-sm mt-1 ${
                    anomaly.severity === 'high'
                      ? 'text-red-700'
                      : anomaly.severity === 'medium'
                        ? 'text-yellow-700'
                        : 'text-blue-700'
                  }`}
                >
                  {anomaly.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Forecast */}
        {data.applicationForecast && data.applicationForecast.length > 0 && (
          <LineChart
            title="Application Forecast (Next 6 Months)"
            data={data.applicationForecast.map((point: any) => ({
              x: point.month,
              y: point.predicted,
            }))}
          />
        )}

        {/* Pipeline Conversion */}
        {data.pipelineConversion && data.pipelineConversion.length > 0 && (
          <BarChart
            title="Pipeline Conversion Funnel"
            data={data.pipelineConversion.map((stage: any) => ({
              label: stage.stage,
              value: stage.count,
            }))}
            color="blue"
          />
        )}

        {/* Status Distribution */}
        {data.statusDistribution && data.statusDistribution.length > 0 && (
          <PieChart
            title="Application Status Distribution"
            data={data.statusDistribution.map((status: any, index: number) => ({
              label: status.status,
              value: status.count,
              color: [
                '#3b82f6',
                '#10b981',
                '#f59e0b',
                '#ef4444',
                '#8b5cf6',
              ][index % 5],
            }))}
          />
        )}

        {/* Time Series */}
        {data.timeSeriesData && data.timeSeriesData.length > 0 && (
          <BarChart
            title="Applications Over Time"
            data={data.timeSeriesData.map((point: any) => ({
              label: point.month,
              value: point.submitted,
            }))}
            color="green"
          />
        )}
      </div>

      {/* Skills Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills in Demand */}
        {data.skillsInDemand && data.skillsInDemand.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Skills in Demand
            </h3>
            <div className="space-y-3">
              {data.skillsInDemand.slice(0, 5).map(
                (skill: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-700">{skill.skill}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${
                              (skill.count /
                                Math.max(
                                  ...data.skillsInDemand.map((s: any) => s.count)
                                )) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-8">
                        {skill.count}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Trending Skills */}
        {data.trendingSkills && data.trendingSkills.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Trending Skills
            </h3>
            <div className="space-y-2">
              {data.trendingSkills.map((skill: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-700 font-medium">{skill.skill}</span>
                    <TrendIndicator
                      trend={skill.trend}
                      label={`${skill.demand} mentions`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Candidate Clusters */}
      {data.candidateClusters && data.candidateClusters.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Candidate Performance Clusters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.candidateClusters.map((cluster: any, index: number) => (
              <div
                key={index}
                className="p-4 rounded-lg border-2"
                style={{
                  borderColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][
                    index
                  ],
                  backgroundColor:
                    ['#dbeafe', '#dcfce7', '#fef3c7', '#fee2e2'][index],
                }}
              >
                <p className="font-semibold text-gray-900">{cluster.cluster}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {cluster.count}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Avg Score: {Math.round(cluster.avgScore * 100)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health Factors */}
      {data.recruitmentHealth && data.recruitmentHealth.factors && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Health Score Breakdown
          </h3>
          <div className="space-y-4">
            {data.recruitmentHealth.factors.map((factor: any, index: number) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 font-medium">{factor.name}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {Math.round(factor.value)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    style={{ width: `${factor.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
