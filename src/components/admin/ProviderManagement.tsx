/**
 * Provider Management Interface - Admin interface for managing healthcare providers
 * Handles provider approval, capacity management, and performance monitoring
 */

import React, { useState, useEffect } from 'react';

// Types
interface PendingProvider {
  user_id: number;
  email: string;
  name: string;
  npi: string;
  license_number: string;
  license_state: string;
  specialty: string;
  created_at: string;
}

interface ProviderPerformance {
  provider_id: number;
  provider_name: string;
  reviews_completed: number;
  avg_review_time_minutes: number;
  high_risk_cases_handled: number;
  period_days: number;
}

interface ProviderManagementProps {
  token: string;
}

const ProviderManagement: React.FC<ProviderManagementProps> = ({ token }) => {
  const [pendingProviders, setPendingProviders] = useState<PendingProvider[]>([]);
  const [providerPerformance, setProviderPerformance] = useState<ProviderPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'performance'>('pending');

  useEffect(() => {
    loadProviderData();
  }, [token]);

  const loadProviderData = async () => {
    try {
      setLoading(true);
      
      const [pendingResponse, performanceResponse] = await Promise.all([
        fetch('/api/v1/admin/providers/pending', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/v1/admin/provider-performance', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (!pendingResponse.ok) {
        throw new Error('Failed to load pending providers');
      }

      const pendingData = await pendingResponse.json();
      setPendingProviders(pendingData.providers || []);

      if (performanceResponse.ok) {
        const performanceData = await performanceResponse.json();
        setProviderPerformance(performanceData || []);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load provider data');
      console.error('Provider data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProvider = async (providerId: number) => {
    try {
      setApproving(providerId);
      
      const response = await fetch(`/api/v1/admin/providers/${providerId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to approve provider');
      }

      const result = await response.json();
      alert(`Provider ${result.provider_name || 'approved'} successfully!`);
      
      // Reload data
      await loadProviderData();
    } catch (err) {
      console.error('Approve provider error:', err);
      alert('Failed to approve provider. Please try again.');
    } finally {
      setApproving(null);
    }
  };

  const getSpecialtyColor = (specialty: string): string => {
    const colors: Record<string, string> = {
      'psychiatry': 'bg-purple-100 text-purple-800',
      'psychology': 'bg-blue-100 text-blue-800',
      'counseling': 'bg-green-100 text-green-800',
      'social work': 'bg-yellow-100 text-yellow-800',
      'nurse practitioner': 'bg-pink-100 text-pink-800',
    };
    return colors[specialty.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getPerformanceColor = (score: number): string => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading provider management...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadProviderData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Provider Management</h1>
              <p className="text-gray-600">Manage healthcare providers and monitor performance</p>
            </div>
            
            <button
              onClick={loadProviderData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">⏳</span>
                Pending Approval ({pendingProviders.length})
              </button>
              <button
                onClick={() => setActiveTab('performance')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'performance'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">📊</span>
                Performance Metrics
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'pending' && (
              <div>
                {pendingProviders.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-6xl mb-4">✅</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All Providers Approved</h3>
                    <p className="text-gray-600">No pending provider applications at this time.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pendingProviders.map((provider) => (
                      <div key={provider.user_id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <h3 className="text-xl font-semibold text-gray-900">{provider.name}</h3>
                              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getSpecialtyColor(provider.specialty)}`}>
                                {provider.specialty}
                              </span>
                              <span className="text-sm text-gray-500">
                                Applied {new Date(provider.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <p className="text-gray-900">{provider.email}</p>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">NPI Number</label>
                                <p className="text-gray-900">{provider.npi}</p>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                                <p className="text-gray-900">{provider.license_number}</p>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">License State</label>
                                <p className="text-gray-900">{provider.license_state}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col space-y-2 ml-6">
                            <button
                              onClick={() => handleApproveProvider(provider.user_id)}
                              disabled={approving === provider.user_id}
                              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                              {approving === provider.user_id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  <span>Approving...</span>
                                </>
                              ) : (
                                <>
                                  <span>✅</span>
                                  <span>Approve Provider</span>
                                </>
                              )}
                            </button>
                            
                            <button className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
                              <span>👁️</span>
                              <span>View Details</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'performance' && (
              <div>
                {providerPerformance.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-6xl mb-4">📊</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Performance Data</h3>
                    <p className="text-gray-600">Performance metrics will appear here as providers complete reviews.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {providerPerformance.map((provider) => {
                      const efficiencyScore = provider.avg_review_time_minutes < 30 ? 10 : 
                                            provider.avg_review_time_minutes < 60 ? 8 : 
                                            provider.avg_review_time_minutes < 120 ? 6 : 4;
                      
                      return (
                        <div key={provider.provider_id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">{provider.provider_name}</h3>
                            <div className={`text-2xl font-bold ${getPerformanceColor(efficiencyScore)}`}>
                              {efficiencyScore}/10
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Reviews Completed</span>
                              <span className="font-medium text-gray-900">{provider.reviews_completed}</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Avg Review Time</span>
                              <span className="font-medium text-gray-900">
                                {provider.avg_review_time_minutes.toFixed(1)} min
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">High-Risk Cases</span>
                              <span className="font-medium text-gray-900">{provider.high_risk_cases_handled}</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Period</span>
                              <span className="font-medium text-gray-900">{provider.period_days} days</span>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Efficiency</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      efficiencyScore >= 8 ? 'bg-green-500' : 
                                      efficiencyScore >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${(efficiencyScore / 10) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {efficiencyScore >= 8 ? 'Excellent' : 
                                   efficiencyScore >= 6 ? 'Good' : 'Needs Improvement'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderManagement;
