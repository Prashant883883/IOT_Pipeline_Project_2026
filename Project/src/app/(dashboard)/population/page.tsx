'use client';

import { useEffect, useState } from 'react';
import { LineChart, StatCard } from '@/components/Charts';
import { Alert } from '@/components/Alert';
import { Button } from '@/components/Button';

interface ForecastData {
  success: boolean;
  data?: {
    forecastPeriod: string;
    applicationTrend: Array<{
      month: string;
      predicted: number;
      trend: string;
    }>;
    pipelineStateForecast: Array<{
      month: string;
      predictedHires: number;
      predictedRejections: number;
      predictedInProgress: number;
      confidence: number;
    }>;
    summary: {
      totalApplicationsHistorical: number;
      averageMonthlyApplications: number;
      predictedTotalHires: number;
      predictedTotalRejections: number;
      predictedTotalInProgress: number;
    };
    volatilityAnalysis: {
      volatility: number;
      anomalyRisk: 'low' | 'medium' | 'high';
      confidence: number;
    };
    recommendations: string[];
    skillDemandForecast: {
      topSkills: string[];
      description: string;
    };
  };
  error?: string;
}

export default function PopulationForecastPage() {
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forecastMonths, setForecastMonths] = useState(6);

  useEffect(() => {
    fetchForecast();
  }, [forecastMonths]);

  const fetchForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/ml/population-forecast?months=${forecastMonths}`);
      if (!response.ok) throw new Error('Failed to fetch forecast');
      const data = await response.json();
      setForecastData(data);
      if (!data.success) {
        setError(data.error || 'Failed to generate forecast');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          <p className="mt-4 text-gray-600">Forecasting population trends...</p>
        </div>
      </div>
    );
  }

  if (error || !forecastData?.success) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Population Forecast</h1>
          <p className="mt-2 text-gray-600">
            Predict future hiring trends and pipeline state
          </p>
        </div>
        <Alert
          type="error"
          title="Error Loading Forecast"
          message={error || 'Unable to generate forecast at this time. Please try again later.'}
        />
      </div>
    );
  }

  const data = forecastData.data;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Population Forecast</h1>
          <p className="mt-2 text-gray-600">
            Predict future hiring trends similar to demographic forecasting. Plan your recruitment pipeline ahead.
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0 space-x-2">
          {[3, 6, 12, 24].map((months) => (
            <Button
              key={months}
              variant={forecastMonths === months ? 'primary' : 'secondary'}
              onClick={() => setForecastMonths(months)}
              size="sm"
            >
              {months} months
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Forecast Period"
          value={data.forecastPeriod}
          subtext="Duration of forecast"
          icon="📅"
        />
        <StatCard
          label="Historical Apps"
          value={data.summary.totalApplicationsHistorical.toString()}
          subtext="Applications to date"
          icon="📨"
        />
        <StatCard
          label="Predicted Hires"
          value={data.summary.predictedTotalHires.toString()}
          subtext="Expected SELECTED status"
          icon="✨"
        />
        <StatCard
          label="Predicted Rejections"
          value={data.summary.predictedTotalRejections.toString()}
          subtext="Expected REJECTED status"
          icon="❌"
        />
        <StatCard
          label="Avg Monthly"
          value={data.summary.averageMonthlyApplications.toString()}
          subtext="Applications per month"
          icon="📊"
        />
      </div>

      {/* Volatility & Risk Analysis */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Forecast Volatility & Risk</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-gray-600 text-sm">Volatility Score</p>
            <p className="text-3xl font-bold text-gray-900">{data.volatilityAnalysis.volatility}</p>
            <p className="text-xs text-gray-500 mt-1">Lower is more stable</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Anomaly Risk</p>
            <p className={`text-3xl font-bold capitalize ${
              data.volatilityAnalysis.anomalyRisk === 'high' ? 'text-red-600' :
              data.volatilityAnalysis.anomalyRisk === 'medium' ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {data.volatilityAnalysis.anomalyRisk}
            </p>
            <p className="text-xs text-gray-500 mt-1">Prediction uncertainty</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Confidence Level</p>
            <div className="mt-2 flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-3 mr-2">
                <div
                  className="bg-primary-600 h-3 rounded-full"
                  style={{ width: `${data.volatilityAnalysis.confidence * 100}%` }}
                ></div>
              </div>
              <span className="text-lg font-bold">{Math.round(data.volatilityAnalysis.confidence * 100)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Forecasts Table */}
      <div className="rounded-lg bg-white shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Month-by-Month Forecast</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Month</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Predicted Apps</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Hires</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rejections</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">In Progress</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.pipelineStateForecast.map((forecast, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{forecast.month}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {data.applicationTrend[idx]?.predicted || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                      {forecast.predictedHires}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                      {forecast.predictedRejections}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                      {forecast.predictedInProgress}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${forecast.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-600">{Math.round(forecast.confidence)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      {data.recommendations && data.recommendations.length > 0 && (
        <div className="rounded-lg bg-white shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 Recommendations</h2>
          <div className="space-y-3">
            {data.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-gray-700">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Skills in Demand */}
      {data.skillDemandForecast && data.skillDemandForecast.topSkills.length > 0 && (
        <div className="rounded-lg bg-white shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">💼 Top Skills in Demand</h2>
          <p className="text-sm text-gray-600 mb-4">{data.skillDemandForecast.description}</p>
          <div className="flex flex-wrap gap-2">
            {data.skillDemandForecast.topSkills.map((skill, idx) => (
              <span key={idx} className="inline-flex items-center rounded-full bg-primary-100 px-4 py-2 text-sm font-medium text-primary-800">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Forecast Visualization */}
      <div className="rounded-lg bg-white shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Volume Trend</h2>
        <LineChart
          data={data.applicationTrend.map(f => ({
            name: f.month,
            value: f.predicted,
          }))}
          title="Predicted Monthly Applications"
        />
      </div>

      {/* How It Works */}
      <div className="rounded-lg bg-primary-50 border border-primary-200 p-6">
        <h2 className="text-lg font-semibold text-primary-900 mb-3">📊 How Population Forecasting Works</h2>
        <div className="space-y-2 text-sm text-primary-800">
          <p>
            <strong>Data Collection:</strong> Analyzes your historical application submission patterns
          </p>
          <p>
            <strong>Trend Analysis:</strong> Calculates linear trends and seasonal adjustments
          </p>
          <p>
            <strong>Pipeline Modeling:</strong> Predicts status distribution (hires, rejections, in-progress)
          </p>
          <p>
            <strong>Confidence Scoring:</strong> Indicates reliability (100% = high certainty)
          </p>
          <p>
            <strong>Risk Assessment:</strong> Detects anomalies and potential bottlenecks
          </p>
        </div>
      </div>
    </div>
  );
}
