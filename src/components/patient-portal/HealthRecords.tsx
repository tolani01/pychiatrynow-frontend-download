import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DocumentTextIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface IntakeReport {
  id: number;
  created_at: string;
  risk_level: string;
  urgency: string;
  severity_level: string;
  review_status: string;
  chief_complaint?: string;
  summary: string;
}

interface IntakeSession {
  id: number;
  created_at: string;
  status: string;
  completed_at: string | null;
  duration_minutes: number | null;
}

interface HealthRecordsData {
  intake_reports: IntakeReport[];
  intake_sessions: IntakeSession[];
  total_reports: number;
  total_sessions: number;
}

const HealthRecords: React.FC = () => {
  const [healthRecords, setHealthRecords] = useState<HealthRecordsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<IntakeReport | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'reports' | 'sessions'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'risk' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const navigate = useNavigate();

  useEffect(() => {
    fetchHealthRecords();
  }, []);

  const fetchHealthRecords = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/v1/patient-portal/health-records', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch health records');
      }

      const data = await response.json();
      setHealthRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (reportId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/v1/reports/${reportId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `health-report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download report:', err);
    }
  };

  const viewReport = (report: IntakeReport) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'medium': return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'low': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default: return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'active': return 'text-blue-600 bg-blue-50';
      case 'paused': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const sortRecords = (records: any[]) => {
    return [...records].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'risk':
          const riskOrder = { high: 3, medium: 2, low: 1 };
          comparison = (riskOrder[a.risk_level] || 0) - (riskOrder[b.risk_level] || 0);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading health records</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={fetchHealthRecords}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!healthRecords) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Health Records</h1>
              <p className="mt-1 text-sm text-gray-500">
                View your mental health assessment reports and session history.
              </p>
            </div>
            <button
              onClick={() => navigate('/patient-portal/dashboard')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Reports</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {healthRecords.total_reports}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Assessment Sessions</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {healthRecords.total_sessions}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CalendarDaysIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Last Assessment</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {healthRecords.intake_reports.length > 0 
                    ? new Date(healthRecords.intake_reports[0].created_at).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <label className="text-sm font-medium text-gray-700">Filter:</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'reports' | 'sessions')}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Records</option>
                  <option value="reports">Reports Only</option>
                  <option value="sessions">Sessions Only</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'risk' | 'status')}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Date</option>
                  <option value="risk">Risk Level</option>
                  <option value="status">Status</option>
                </select>
              </div>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
              </button>
            </div>
          </div>
        </div>

        {/* Reports Section */}
        {(filter === 'all' || filter === 'reports') && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Assessment Reports</h2>
            {healthRecords.intake_reports.length > 0 ? (
              <div className="space-y-4">
                {sortRecords(healthRecords.intake_reports).map((report) => (
                  <div key={report.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            Mental Health Assessment
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRiskColor(report.risk_level)}`}>
                            {report.risk_level} risk
                          </span>
                          <div className="flex items-center gap-1">
                            {getUrgencyIcon(report.urgency)}
                            <span className="text-xs text-gray-500">{report.urgency} urgency</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {report.chief_complaint || 'Mental health assessment completed'}
                        </p>
                        
                        <p className="text-sm text-gray-500 mb-4">
                          {report.summary}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Created: {formatDate(report.created_at)}</span>
                          <span>Severity: {report.severity_level}</span>
                          <span>Status: {report.review_status}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => viewReport(report)}
                          className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-300 rounded-md hover:bg-blue-50"
                        >
                          <EyeIcon className="h-4 w-4" />
                          View
                        </button>
                        <button
                          onClick={() => downloadReport(report.id)}
                          className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 hover:text-green-700 border border-green-300 rounded-md hover:bg-green-50"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No assessment reports</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Complete a mental health assessment to generate your first report.
                </p>
                <button
                  onClick={() => navigate('/intake')}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Start Assessment
                </button>
              </div>
            )}
          </div>
        )}

        {/* Sessions Section */}
        {(filter === 'all' || filter === 'sessions') && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Assessment Sessions</h2>
            {healthRecords.intake_sessions.length > 0 ? (
              <div className="space-y-4">
                {sortRecords(healthRecords.intake_sessions).map((session) => (
                  <div key={session.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <ClockIcon className="h-8 w-8 text-gray-400" />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            Assessment Session
                          </h3>
                          <p className="text-sm text-gray-500">
                            Started: {formatDate(session.created_at)}
                          </p>
                          {session.completed_at && (
                            <p className="text-sm text-gray-500">
                              Completed: {formatDate(session.completed_at)}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            Duration: {formatDuration(session.duration_minutes)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.status)}`}>
                          {session.status}
                        </span>
                        {session.status === 'active' && (
                          <button
                            onClick={() => navigate(`/intake?session=${session.id}`)}
                            className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
                          >
                            Continue
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No assessment sessions</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start a mental health assessment to begin tracking your sessions.
                </p>
                <button
                  onClick={() => navigate('/intake')}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Start Assessment
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Assessment Report</h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Risk Level:</span>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getRiskColor(selectedReport.risk_level)}`}>
                    {selectedReport.risk_level}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Urgency:</span>
                  <span className="ml-2">{selectedReport.urgency}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Severity:</span>
                  <span className="ml-2">{selectedReport.severity_level}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className="ml-2">{selectedReport.review_status}</span>
                </div>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Chief Complaint:</span>
                <p className="mt-1 text-gray-600">{selectedReport.chief_complaint || 'Not specified'}</p>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Summary:</span>
                <p className="mt-1 text-gray-600">{selectedReport.summary}</p>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Report Date:</span>
                <p className="mt-1 text-gray-600">{formatDate(selectedReport.created_at)}</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => downloadReport(selectedReport.id)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Download PDF
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthRecords;
