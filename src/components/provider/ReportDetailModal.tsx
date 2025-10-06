/**
 * Report Detail Modal - Comprehensive report review with clinical notes
 * Provides full report view with provider actions and note-taking
 */

import React, { useState, useEffect } from 'react';

// Types
interface ReportData {
  id: number;
  patient_id: number;
  patient_name?: string;
  risk_level: string;
  urgency: string;
  severity_level: string;
  created_at: string;
  report_data: {
    chief_complaint?: string;
    history_of_present_illness?: string;
    safety_assessment?: string;
    psychiatric_history?: string;
    medical_history?: string;
    substance_history?: string;
    family_history?: string;
    social_history?: string;
    patient_statements?: Array<{
      category: string;
      statement: string;
      lightly_edited: boolean;
    }>;
    screeners?: Array<{
      name: string;
      score: number;
      max_score: number;
      severity: string;
      interpretation: string;
      subscales?: Record<string, any>;
    }>;
    summary_impression?: string;
    treatment_recommendations?: string;
    clinical_assessment?: string;
    differential_diagnosis?: string;
    risk_assessment?: string;
  };
}

interface ClinicalNotesRequest {
  clinical_notes: string;
  treatment_plan?: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  risk_assessment?: string;
}

interface ReportDetailModalProps {
  reportId: number;
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onReportUpdated?: () => void;
}

const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  reportId,
  isOpen,
  onClose,
  token,
  onReportUpdated
}) => {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'screeners' | 'quotes' | 'notes'>('summary');
  const [saving, setSaving] = useState(false);
  
  // Clinical notes form
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [riskAssessment, setRiskAssessment] = useState('');

  useEffect(() => {
    if (isOpen && reportId) {
      loadReport();
    }
  }, [isOpen, reportId, token]);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/v1/provider/reports/${reportId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load report');
      }

      const data = await response.json();
      setReport(data);
      
      // Initialize form with existing data if available
      if (data.existing_review) {
        setClinicalNotes(data.existing_review.clinical_notes || '');
        setTreatmentPlan(data.existing_review.recommendations || '');
        setFollowUpRequired(data.existing_review.follow_up_required || false);
        setFollowUpDate(data.existing_review.follow_up_date || '');
        setRiskAssessment(data.existing_review.risk_assessment || '');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
      console.error('Report load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveClinicalNotes = async () => {
    try {
      setSaving(true);
      
      const requestData: ClinicalNotesRequest = {
        clinical_notes: clinicalNotes,
        treatment_plan: treatmentPlan,
        follow_up_required: followUpRequired,
        follow_up_date: followUpDate || undefined,
        risk_assessment: riskAssessment
      };

      const response = await fetch(`/api/v1/provider/reports/${reportId}/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error('Failed to save clinical notes');
      }

      // Refresh report data
      await loadReport();
      onReportUpdated?.();
      
      // Show success message
      alert('Clinical notes saved successfully!');
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save clinical notes. Please try again.');
    } finally {
      setSaving(false);
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

  const getSeverityColor = (severity: string): string => {
    switch (severity.toLowerCase()) {
      case 'severe': return 'text-red-600 font-semibold';
      case 'moderate': return 'text-yellow-600 font-semibold';
      case 'mild': return 'text-green-600 font-semibold';
      default: return 'text-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Patient Report #{report?.patient_id}
                </h2>
                <p className="text-sm text-gray-600">
                  {report?.patient_name || 'Unknown Patient'} • Created {new Date(report?.created_at || '').toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getRiskLevelColor(report?.risk_level || 'low')}`}>
                  {report?.risk_level?.toUpperCase()} RISK
                </span>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading report...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Report</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button 
                  onClick={loadReport}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : report ? (
              <>
                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8 px-6">
                    {[
                      { id: 'summary', label: 'Summary', icon: '📋' },
                      { id: 'screeners', label: 'Screeners', icon: '📊' },
                      { id: 'quotes', label: 'Patient Quotes', icon: '💬' },
                      { id: 'notes', label: 'Clinical Notes', icon: '📝' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6 max-h-96 overflow-y-auto">
                  {activeTab === 'summary' && (
                    <div className="space-y-6">
                      {/* Chief Complaint */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Chief Complaint</h3>
                        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                          {report.report_data.chief_complaint || 'No chief complaint provided'}
                        </p>
                      </div>

                      {/* History of Present Illness */}
                      {report.report_data.history_of_present_illness && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">History of Present Illness</h3>
                          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                            {report.report_data.history_of_present_illness}
                          </p>
                        </div>
                      )}

                      {/* Safety Assessment */}
                      {report.report_data.safety_assessment && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Safety Assessment</h3>
                          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                            <p className="text-red-800 whitespace-pre-wrap">{report.report_data.safety_assessment}</p>
                          </div>
                        </div>
                      )}

                      {/* Clinical Assessment */}
                      {report.report_data.clinical_assessment && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Clinical Assessment</h3>
                          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                            {report.report_data.clinical_assessment}
                          </p>
                        </div>
                      )}

                      {/* Treatment Recommendations */}
                      {report.report_data.treatment_recommendations && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Treatment Recommendations</h3>
                          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                            {report.report_data.treatment_recommendations}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'screeners' && (
                    <div className="space-y-6">
                      {report.report_data.screeners?.map((screener, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{screener.name}</h3>
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-medium ${getSeverityColor(screener.severity)}`}>
                                {screener.severity.toUpperCase()}
                              </span>
                              <span className="text-sm text-gray-600">
                                {screener.score}/{screener.max_score}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm">{screener.interpretation}</p>
                        </div>
                      )) || (
                        <p className="text-gray-500 text-center py-8">No screener data available</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'quotes' && (
                    <div className="space-y-4">
                      {report.report_data.patient_statements?.map((statement, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 capitalize">{statement.category}</h4>
                            {statement.lightly_edited && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                Lightly Edited
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 italic">"{statement.statement}"</p>
                        </div>
                      )) || (
                        <p className="text-gray-500 text-center py-8">No patient quotes available</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'notes' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Clinical Notes *
                        </label>
                        <textarea
                          value={clinicalNotes}
                          onChange={(e) => setClinicalNotes(e.target.value)}
                          rows={6}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your clinical observations, assessment, and recommendations..."
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Treatment Plan
                        </label>
                        <textarea
                          value={treatmentPlan}
                          onChange={(e) => setTreatmentPlan(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter treatment recommendations and next steps..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Risk Assessment
                        </label>
                        <textarea
                          value={riskAssessment}
                          onChange={(e) => setRiskAssessment(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Assess current risk level and safety considerations..."
                        />
                      </div>

                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={followUpRequired}
                            onChange={(e) => setFollowUpRequired(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Follow-up required</span>
                        </label>
                        
                        {followUpRequired && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Follow-up Date
                            </label>
                            <input
                              type="date"
                              value={followUpDate}
                              onChange={(e) => setFollowUpDate(e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Report ID: {report.id} • Created: {new Date(report.created_at).toLocaleString()}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      
                      {activeTab === 'notes' && (
                        <button
                          onClick={saveClinicalNotes}
                          disabled={saving || !clinicalNotes.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? 'Saving...' : 'Save Clinical Notes'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailModal;
