/**
 * Admin Dashboard - System management and oversight interface
 * Provides comprehensive system statistics, provider management, and assignment tools
 */

import React, { useState, useEffect } from 'react';

// Types
interface SystemStats {
  total_reports: number;
  assigned_reports: number;
  unassigned_reports: number;
  high_risk_unassigned: number;
  total_providers: number;
  active_providers: number;
  pending_providers: number;
  assignment_rate: number;
}

interface UnassignedReport {
  id: number;
  patient_id: number;
  risk_level: string;
  urgency: string;
  created_at: string;
  chief_complaint?: string;
}

interface ProviderWorkload {
  provider_id: number;
  provider_name: string;
  pending_reports: number;
  high_risk_reports: number;
  max_caseload: number;
  utilization_percent: number;
}

interface AdminDashboardProps {
  token: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ token }) => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [unassignedReports, setUnassignedReports] = useState<UnassignedReport[]>([]);
  const [providerWorkloads, setProviderWorkloads] = useState<ProviderWorkload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReports, setSelectedReports] = useState<number[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [token]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [statsResponse, unassignedResponse, assignmentResponse] = await Promise.all([
        fetch('/api/v1/admin/system-stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/v1/admin/unassigned-reports', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/v1/admin/assignment-stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (!statsResponse.ok || !unassignedResponse.ok || !assignmentResponse.ok) {
        throw new Error('Failed to load dashboard data');
      }

      const [statsData, unassignedData, assignmentData] = await Promise.all([
        statsResponse.json(),
        unassignedResponse.json(),
        assignmentResponse.json()
      ]);

      setStats(statsData);
      setUnassignedReports(unassignedData);
      setProviderWorkloads(assignmentData.provider_workloads);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAssign = async (reportId: number) => {
    try {
      setAssigning(true);
      
      const response = await fetch(`/api/v1/admin/auto-assign-report/${reportId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to auto-assign report');
      }

      const result = await response.json();
      alert(`Report auto-assigned to ${result.assigned_provider_name}`);
      
      // Reload data
      await loadDashboardData();
    } catch (err) {
      console.error('Auto-assign error:', err);
      alert('Failed to auto-assign report. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  const handleManualAssign = async () => {
    if (!selectedProvider || selectedReports.length === 0) {
      alert('Please select a provider and at least one report');
      return;
    }

    try {
      setAssigning(true);
      
      const promises = selectedReports.map(reportId =>
        fetch('/api/v1/admin/manual-assign-report', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            report_id: reportId,
            provider_id: selectedProvider
          })
        })
      );

      const responses = await Promise.all(promises);
      
      if (responses.every(r => r.ok)) {
        alert(`Successfully assigned ${selectedReports.length} report(s)`);
        setSelectedReports([]);
        setSelectedProvider(null);
        await loadDashboardData();
      } else {
        throw new Error('Some assignments failed');
      }
    } catch (err) {
      console.error('Manual assign error:', err);
      alert('Failed to assign reports. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  const getRiskLevelColor = (riskLevel: string): string => {
    switch (riskLevel.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: string): string => {
    switch (urgency.toLowerCase()) {
      case 'emergent': return 'bg-red-500 text-white';
      case 'urgent': return 'bg-orange-500 text-white';
      case 'routine': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getUtilizationColor = (percent: number): string => {
    if (percent >= 90) return 'text-red-600';
    if (percent >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadDashboardData}
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
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">System management and oversight</p>
            </div>
            
            <button
              onClick={loadDashboardData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    📊
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Reports</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total_reports}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    ✅
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Assigned Reports</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.assigned_reports}</p>
                  <p className="text-xs text-gray-500">{stats.assignment_rate.toFixed(1)}% assignment rate</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    ⏳
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Unassigned Reports</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.unassigned_reports}</p>
                  {stats.high_risk_unassigned > 0 && (
                    <p className="text-xs text-red-600">{stats.high_risk_unassigned} high-risk</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    👥
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Providers</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.active_providers}</p>
                  {stats.pending_providers > 0 && (
                    <p className="text-xs text-orange-600">{stats.pending_providers} pending approval</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Provider Workloads */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Provider Workloads</h2>
          </div>
          <div className="p-6">
            {providerWorkloads.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No provider data available</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {providerWorkloads.map((provider) => (
                  <div key={provider.provider_id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{provider.provider_name}</h3>
                      <span className={`text-sm font-medium ${getUtilizationColor(provider.utilization_percent)}`}>
                        {provider.utilization_percent.toFixed(0)}%
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Pending: {provider.pending_reports}</div>
                      <div>High Risk: {provider.high_risk_reports}</div>
                      <div>Max Capacity: {provider.max_caseload}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Unassigned Reports */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Unassigned Reports ({unassignedReports.length})
              </h2>
              {selectedReports.length > 0 && (
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedProvider || ''}
                    onChange={(e) => setSelectedProvider(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Provider</option>
                    {providerWorkloads.map((provider) => (
                      <option key={provider.provider_id} value={provider.provider_id}>
                        {provider.provider_name} ({provider.utilization_percent.toFixed(0)}% capacity)
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleManualAssign}
                    disabled={assigning || !selectedProvider}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {assigning ? 'Assigning...' : `Assign ${selectedReports.length} Report(s)`}
                  </button>
                </div>
              )}
            </div>
          </div>

          {unassignedReports.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">🎉</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Reports Assigned</h3>
              <p className="text-gray-600">Great job! All reports have been assigned to providers.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {unassignedReports.map((report) => (
                <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedReports.includes(report.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedReports([...selectedReports, report.id]);
                              } else {
                                setSelectedReports(selectedReports.filter(id => id !== report.id));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <h3 className="text-lg font-medium text-gray-900">
                            Patient #{report.patient_id}
                          </h3>
                        </div>
                        
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRiskLevelColor(report.risk_level)}`}>
                          {report.risk_level.toUpperCase()} RISK
                        </span>
                        
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(report.urgency)}`}>
                          {report.urgency.toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-2">
                        {report.chief_complaint || 'No chief complaint available'}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Created: {new Date(report.created_at).toLocaleDateString()}</span>
                        <span>Report ID: {report.id}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAutoAssign(report.id)}
                        disabled={assigning}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        🤖 Auto-Assign
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
