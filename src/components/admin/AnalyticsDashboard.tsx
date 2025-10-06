/**
 * Analytics Dashboard - Comprehensive reporting and analytics interface
 * Provides insights into system performance, provider efficiency, and patient outcomes
 */

import React, { useState, useEffect } from 'react';

// Types
interface AnalyticsData {
  system_metrics: {
    total_patients: number;
    total_reports: number;
    avg_completion_time: number;
    assignment_rate: number;
    high_risk_detection_rate: number;
  };
  provider_metrics: {
    total_providers: number;
    active_providers: number;
    avg_reviews_per_day: number;
    avg_review_time: number;
    provider_satisfaction: number;
  };
  clinical_metrics: {
    common_diagnoses: Array<{
      diagnosis: string;
      count: number;
      percentage: number;
    }>;
    risk_distribution: {
      high: number;
      moderate: number;
      low: number;
    };
    screener_usage: Array<{
      screener: string;
      usage_count: number;
      avg_score: number;
    }>;
  };
  time_series: {
    reports_per_day: Array<{
      date: string;
      count: number;
    }>;
    completion_times: Array<{
      date: string;
      avg_time: number;
    }>;
  };
}

interface AnalyticsDashboardProps {
  token: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ token }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [token, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Simulate analytics data since we don't have a dedicated analytics endpoint yet
      // In a real implementation, this would call /api/v1/admin/analytics
      const mockData: AnalyticsData = {
        system_metrics: {
          total_patients: 1247,
          total_reports: 1189,
          avg_completion_time: 18.5,
          assignment_rate: 94.2,
          high_risk_detection_rate: 12.8
        },
        provider_metrics: {
          total_providers: 23,
          active_providers: 19,
          avg_reviews_per_day: 42.3,
          avg_review_time: 24.7,
          provider_satisfaction: 4.6
        },
        clinical_metrics: {
          common_diagnoses: [
            { diagnosis: 'Major Depressive Disorder', count: 287, percentage: 24.1 },
            { diagnosis: 'Generalized Anxiety Disorder', count: 198, percentage: 16.7 },
            { diagnosis: 'Adjustment Disorder', count: 156, percentage: 13.1 },
            { diagnosis: 'Bipolar Disorder', count: 89, percentage: 7.5 },
            { diagnosis: 'PTSD', count: 67, percentage: 5.6 }
          ],
          risk_distribution: {
            high: 152,
            moderate: 534,
            low: 503
          },
          screener_usage: [
            { screener: 'PHQ-9', usage_count: 1189, avg_score: 12.3 },
            { screener: 'GAD-7', usage_count: 1156, avg_score: 8.7 },
            { screener: 'C-SSRS', usage_count: 1189, avg_score: 2.1 },
            { screener: 'PCL-5', usage_count: 234, avg_score: 15.2 },
            { screener: 'ASRS', usage_count: 189, avg_score: 18.9 }
          ]
        },
        time_series: {
          reports_per_day: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            count: Math.floor(Math.random() * 20) + 30
          })),
          completion_times: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            avg_time: Math.floor(Math.random() * 10) + 15
          }))
        }
      };
      
      setAnalytics(mockData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      console.error('Analytics load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMetricColor = (value: number, thresholds: { good: number; warning: number }): string => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatPercentage = (value: number): string => `${value.toFixed(1)}%`;
  const formatTime = (minutes: number): string => `${minutes.toFixed(1)} min`;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analytics Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadAnalytics}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">System performance and clinical insights</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              
              <button
                onClick={loadAnalytics}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  👥
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Patients</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.system_metrics.total_patients.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  📊
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Assignment Rate</p>
                <p className={`text-2xl font-semibold ${getMetricColor(analytics.system_metrics.assignment_rate, { good: 90, warning: 75 })}`}>
                  {formatPercentage(analytics.system_metrics.assignment_rate)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  ⏱️
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Review Time</p>
                <p className={`text-2xl font-semibold ${getMetricColor(analytics.provider_metrics.avg_review_time, { good: 20, warning: 30 })}`}>
                  {formatTime(analytics.provider_metrics.avg_review_time)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  🚨
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">High-Risk Detection</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatPercentage(analytics.system_metrics.high_risk_detection_rate)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  ⭐
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Provider Satisfaction</p>
                <p className={`text-2xl font-semibold ${getMetricColor(analytics.provider_metrics.provider_satisfaction, { good: 4.5, warning: 3.5 })}`}>
                  {analytics.provider_metrics.provider_satisfaction}/5
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Common Diagnoses */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Common Diagnoses</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics.clinical_metrics.common_diagnoses.map((diagnosis, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{diagnosis.diagnosis}</p>
                      <p className="text-xs text-gray-500">{diagnosis.count} cases</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${diagnosis.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12 text-right">
                        {formatPercentage(diagnosis.percentage)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Risk Distribution */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Risk Distribution</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-sm font-medium text-gray-900">High Risk</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{analytics.clinical_metrics.risk_distribution.high}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-sm font-medium text-gray-900">Moderate Risk</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{analytics.clinical_metrics.risk_distribution.moderate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm font-medium text-gray-900">Low Risk</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{analytics.clinical_metrics.risk_distribution.low}</span>
                </div>
              </div>
              
              {/* Simple pie chart representation */}
              <div className="mt-6 flex justify-center">
                <div className="w-32 h-32 rounded-full relative overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 w-full h-full bg-red-500"
                    style={{ 
                      clipPath: `polygon(50% 50%, 50% 0%, ${50 + (analytics.clinical_metrics.risk_distribution.high / 1189) * 50}% 0%)` 
                    }}
                  ></div>
                  <div 
                    className="absolute top-0 left-0 w-full h-full bg-yellow-500"
                    style={{ 
                      clipPath: `polygon(50% 50%, ${50 + (analytics.clinical_metrics.risk_distribution.high / 1189) * 50}% 0%, ${50 + ((analytics.clinical_metrics.risk_distribution.high + analytics.clinical_metrics.risk_distribution.moderate) / 1189) * 50}% 0%)` 
                    }}
                  ></div>
                  <div 
                    className="absolute top-0 left-0 w-full h-full bg-green-500"
                    style={{ 
                      clipPath: `polygon(50% 50%, ${50 + ((analytics.clinical_metrics.risk_distribution.high + analytics.clinical_metrics.risk_distribution.moderate) / 1189) * 50}% 0%, 50% 50%)` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Screener Usage */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Screener Usage & Performance</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analytics.clinical_metrics.screener_usage.map((screener, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{screener.screener}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Usage Count</span>
                      <span className="font-medium">{screener.usage_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Avg Score</span>
                      <span className="font-medium">{screener.avg_score.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Time Series Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Reports per Day</h2>
            </div>
            <div className="p-6">
              <div className="h-64 flex items-end justify-between space-x-1">
                {analytics.time_series.reports_per_day.slice(-14).map((day, index) => (
                  <div key={index} className="flex flex-col items-center space-y-1">
                    <div 
                      className="w-8 bg-blue-500 rounded-t"
                      style={{ height: `${(day.count / 50) * 200}px` }}
                    ></div>
                    <span className="text-xs text-gray-500 transform -rotate-45">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Average Review Time</h2>
            </div>
            <div className="p-6">
              <div className="h-64 flex items-end justify-between space-x-1">
                {analytics.time_series.completion_times.slice(-14).map((day, index) => (
                  <div key={index} className="flex flex-col items-center space-y-1">
                    <div 
                      className="w-8 bg-green-500 rounded-t"
                      style={{ height: `${(day.avg_time / 30) * 200}px` }}
                    ></div>
                    <span className="text-xs text-gray-500 transform -rotate-45">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
