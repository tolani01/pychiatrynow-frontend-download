/**
 * Clinical Insights Dashboard - AI-powered clinical decision support
 * Provides comprehensive clinical analysis, treatment recommendations, and insights
 */

import React, { useState, useEffect } from 'react';

// Types
interface ClinicalAnalysis {
  pattern_analysis: {
    detected_conditions: Array<{
      condition: string;
      confidence_score: number;
      severity: string;
      detected_keywords: string[];
      severity_indicators: string[];
      screener_evidence: any;
    }>;
    symptom_severity: Record<string, string>;
    pattern_confidence: Record<string, number>;
    symptom_clusters: Record<string, any>;
    risk_indicators: string[];
  };
  risk_assessment: {
    overall_risk: string;
    risk_factors: string[];
    protective_factors: string[];
    suicide_risk: string;
    self_harm_risk: string;
    violence_risk: string;
    substance_risk: string;
  };
  differential_diagnosis: Array<{
    diagnosis: string;
    confidence: number;
    severity: string;
    supporting_evidence: string[];
    rule_out: string[];
  }>;
  clinical_impression: string;
}

interface TreatmentRecommendations {
  immediate_actions: string[];
  treatment_modalities: string[];
  medication_considerations: string[];
  psychotherapy_recommendations: string[];
  monitoring_plan: string[];
  follow_up_schedule: string;
}

interface ClinicalInsightsProps {
  reportId: number;
  token: string;
  onAnalysisComplete?: (insights: any) => void;
}

const ClinicalInsights: React.FC<ClinicalInsightsProps> = ({
  reportId,
  token,
  onAnalysisComplete
}) => {
  const [analysis, setAnalysis] = useState<ClinicalAnalysis | null>(null);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [treatmentRecs, setTreatmentRecs] = useState<TreatmentRecommendations | null>(null);
  const [confidenceScores, setConfidenceScores] = useState<Record<string, number>>({});
  const [redFlags, setRedFlags] = useState<any[]>([]);
  const [followUpPriorities, setFollowUpPriorities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'treatment' | 'risk' | 'diagnosis'>('overview');

  useEffect(() => {
    if (reportId) {
      loadExistingInsights();
    }
  }, [reportId]);

  const loadExistingInsights = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/v1/clinical-insights/report/${reportId}/insights`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const insights = data.analysis;
        
        setAnalysis(insights.clinical_analysis);
        setAiInsights(insights.ai_insights);
        setTreatmentRecs(insights.treatment_recommendations);
        setConfidenceScores(insights.confidence_scores);
        setRedFlags(insights.red_flags);
        setFollowUpPriorities(insights.follow_up_priorities);
        
        onAnalysisComplete?.(insights);
      } else if (response.status === 404) {
        // No existing analysis, ready to run new one
        setError(null);
      } else {
        throw new Error('Failed to load insights');
      }
    } catch (err) {
      console.error('Load insights error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/v1/clinical-insights/analyze-report', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          report_id: reportId,
          include_ai_insights: true,
          include_treatment_recommendations: true,
          include_risk_assessment: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to run clinical analysis');
      }

      const data = await response.json();
      
      setAnalysis(data.clinical_analysis);
      setAiInsights(data.ai_insights);
      setTreatmentRecs(data.treatment_recommendations);
      setConfidenceScores(data.confidence_scores);
      setRedFlags(data.red_flags);
      setFollowUpPriorities(data.follow_up_priorities);
      
      onAnalysisComplete?.(data);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to run analysis');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string): string => {
    switch (risk.toLowerCase()) {
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

  const getConfidenceColor = (score: number): string => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Running clinical analysis...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Clinical Insights</h1>
              <p className="text-gray-600">AI-powered clinical analysis and decision support</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {!analysis && (
                <button
                  onClick={runAnalysis}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  🤖 Run AI Analysis
                </button>
              )}
              
              {analysis && (
                <button
                  onClick={runAnalysis}
                  disabled={loading}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  🔄 Refresh Analysis
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-500 text-xl mr-3">⚠️</div>
              <div>
                <h3 className="text-red-800 font-medium">Analysis Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Red Flags Alert */}
        {redFlags.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-3">
              <div className="text-red-500 text-xl mr-3">🚨</div>
              <h3 className="text-red-800 font-semibold">Clinical Red Flags</h3>
            </div>
            <div className="space-y-2">
              {redFlags.map((flag, index) => (
                <div key={index} className="bg-red-100 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-red-800">{flag.description}</h4>
                      <p className="text-sm text-red-700 mt-1">{flag.action_required}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      flag.severity === 'critical' ? 'bg-red-600 text-white' : 'bg-red-200 text-red-800'
                    }`}>
                      {flag.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'analysis', label: 'Clinical Analysis', icon: '🔍' },
                { id: 'treatment', label: 'Treatment', icon: '💊' },
                { id: 'risk', label: 'Risk Assessment', icon: '⚠️' },
                { id: 'diagnosis', label: 'Differential Diagnosis', icon: '🩺' }
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
          <div className="p-6">
            {!analysis ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🤖</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Available</h3>
                <p className="text-gray-600 mb-6">Run AI clinical analysis to get comprehensive insights and recommendations.</p>
                <button
                  onClick={runAnalysis}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start AI Analysis
                </button>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Clinical Impression */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Clinical Impression</h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-gray-800">{analysis.clinical_impression}</p>
                      </div>
                    </div>

                    {/* AI Insights */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Clinical Insights</h3>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="whitespace-pre-wrap text-gray-800">{aiInsights}</div>
                      </div>
                    </div>

                    {/* Detected Conditions */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Detected Conditions</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {analysis.pattern_analysis.detected_conditions.map((condition, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900 capitalize">
                                {condition.condition.replace('_', ' ')}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <span className={`text-sm font-medium ${getSeverityColor(condition.severity)}`}>
                                  {condition.severity.toUpperCase()}
                                </span>
                                <span className={`text-sm font-medium ${getConfidenceColor(confidenceScores[condition.condition] || 0)}`}>
                                  {Math.round((confidenceScores[condition.condition] || 0) * 100)}%
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">
                              Confidence: {condition.confidence_score}/10
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Follow-up Priorities */}
                    {followUpPriorities.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Follow-up Priorities</h3>
                        <div className="space-y-2">
                          {followUpPriorities.map((priority, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                priority.priority === 'immediate' ? 'bg-red-100 text-red-800' :
                                priority.priority === 'urgent' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {priority.priority.toUpperCase()}
                              </span>
                              <div>
                                <p className="font-medium text-gray-900">{priority.description}</p>
                                <p className="text-sm text-gray-600">{priority.timeline}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'analysis' && (
                  <div className="space-y-6">
                    {/* Pattern Analysis */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Symptom Pattern Analysis</h3>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {analysis.pattern_analysis.detected_conditions.map((condition, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <h4 className="font-medium text-gray-900 mb-2 capitalize">
                                {condition.condition.replace('_', ' ')}
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="font-medium">Severity:</span>
                                  <span className={`ml-2 ${getSeverityColor(condition.severity)}`}>
                                    {condition.severity.toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium">Confidence:</span>
                                  <span className="ml-2">{condition.confidence_score}/10</span>
                                </div>
                                {condition.detected_keywords.length > 0 && (
                                  <div>
                                    <span className="font-medium">Keywords:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {condition.detected_keywords.map((keyword, i) => (
                                        <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                          {keyword}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Symptom Clusters */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Symptom Clusters</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(analysis.pattern_analysis.symptom_clusters).map(([cluster, conditions]) => (
                          <div key={cluster} className="bg-white border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-2 capitalize">
                              {cluster.replace('_', ' ')}
                            </h4>
                            {conditions.length > 0 ? (
                              <div className="space-y-1">
                                {conditions.map((condition: any, index: number) => (
                                  <div key={index} className="text-sm text-gray-600">
                                    • {condition.condition.replace('_', ' ')}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No conditions detected</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'treatment' && treatmentRecs && (
                  <div className="space-y-6">
                    {/* Immediate Actions */}
                    {treatmentRecs.immediate_actions.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Immediate Actions Required</h3>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <ul className="space-y-2">
                            {treatmentRecs.immediate_actions.map((action, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-red-500 mr-2">⚠️</span>
                                <span className="text-red-800">{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Treatment Modalities */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommended Treatments</h3>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <ul className="space-y-2">
                          {treatmentRecs.treatment_modalities.map((modality, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-green-500 mr-2">✅</span>
                              <span className="text-green-800">{modality}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Monitoring Plan */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Monitoring Plan</h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <ul className="space-y-2">
                          {treatmentRecs.monitoring_plan.map((plan, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-blue-500 mr-2">📋</span>
                              <span className="text-blue-800">{plan}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Follow-up Schedule */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Follow-up Schedule</h3>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-gray-800 capitalize">
                          {treatmentRecs.follow_up_schedule.replace('_', ' ')} follow-up recommended
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'risk' && (
                  <div className="space-y-6">
                    {/* Overall Risk */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Overall Risk Assessment</h3>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-4">
                          <span className={`px-4 py-2 text-lg font-semibold rounded-lg border ${getRiskColor(analysis.risk_assessment.overall_risk)}`}>
                            {analysis.risk_assessment.overall_risk.toUpperCase()} RISK
                          </span>
                          <div className="text-sm text-gray-600">
                            Last assessed: {new Date().toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Specific Risk Areas */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Specific Risk Areas</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { key: 'suicide_risk', label: 'Suicide Risk' },
                          { key: 'self_harm_risk', label: 'Self-Harm Risk' },
                          { key: 'violence_risk', label: 'Violence Risk' },
                          { key: 'substance_risk', label: 'Substance Risk' }
                        ].map((risk) => (
                          <div key={risk.key} className="bg-white border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-2">{risk.label}</h4>
                            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getRiskColor(analysis.risk_assessment[risk.key as keyof typeof analysis.risk_assessment] as string)}`}>
                              {(analysis.risk_assessment[risk.key as keyof typeof analysis.risk_assessment] as string).toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Risk Factors */}
                    {analysis.risk_assessment.risk_factors.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Risk Factors</h3>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <ul className="space-y-2">
                            {analysis.risk_assessment.risk_factors.map((factor, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-red-500 mr-2">⚠️</span>
                                <span className="text-red-800">{factor}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Protective Factors */}
                    {analysis.risk_assessment.protective_factors.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Protective Factors</h3>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <ul className="space-y-2">
                            {analysis.risk_assessment.protective_factors.map((factor, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-green-500 mr-2">✅</span>
                                <span className="text-green-800">{factor}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'diagnosis' && (
                  <div className="space-y-6">
                    {/* Differential Diagnosis */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Differential Diagnosis</h3>
                      <div className="space-y-4">
                        {analysis.differential_diagnosis.map((diagnosis, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-lg font-medium text-gray-900">{diagnosis.diagnosis}</h4>
                              <div className="flex items-center space-x-2">
                                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getRiskColor(diagnosis.severity)}`}>
                                  {diagnosis.severity.toUpperCase()}
                                </span>
                                <span className={`text-sm font-medium ${getConfidenceColor(diagnosis.confidence / 10)}`}>
                                  {diagnosis.confidence}/10
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="font-medium text-gray-700 mb-2">Supporting Evidence</h5>
                                <div className="flex flex-wrap gap-1">
                                  {diagnosis.supporting_evidence.map((evidence, i) => (
                                    <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                      {evidence}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <h5 className="font-medium text-gray-700 mb-2">Rule Out</h5>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {diagnosis.rule_out.map((rule, i) => (
                                    <li key={i}>• {rule}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalInsights;
