/**
 * Patient Report Card - Optimized card component for quick patient review
 * Displays essential information for provider efficiency
 */

import React, { useState } from 'react';

// Types
interface ReportListItem {
  id: number;
  patient_id: number;
  severity_level: string;
  risk_level: string;
  urgency: string;
  created_at: string;
  chief_complaint?: string;
}

interface PatientReportCardProps {
  report: ReportListItem;
  onReview: (reportId: number) => void;
  onAddNotes: (reportId: number) => void;
  onAssignFollowUp: (reportId: number) => void;
  compact?: boolean;
}

const PatientReportCard: React.FC<PatientReportCardProps> = ({
  report,
  onReview,
  onAddNotes,
  onAssignFollowUp,
  compact = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getRiskLevelColor = (riskLevel: string): string => {
    switch (riskLevel.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200 ring-red-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200 ring-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200 ring-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 ring-gray-200';
    }
  };

  const getUrgencyColor = (urgency: string): string => {
    switch (urgency.toLowerCase()) {
      case 'emergent': return 'bg-red-500 text-white shadow-red-200';
      case 'urgent': return 'bg-orange-500 text-white shadow-orange-200';
      case 'routine': return 'bg-blue-500 text-white shadow-blue-200';
      default: return 'bg-gray-500 text-white shadow-gray-200';
    }
  };

  const getSeverityIcon = (severity: string): string => {
    switch (severity.toLowerCase()) {
      case 'severe': return '🔴';
      case 'moderate': return '🟡';
      case 'mild': return '🟢';
      default: return '⚪';
    }
  };

  const getTimeSinceCreated = (createdAt: string): string => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getPriorityScore = (): number => {
    let score = 0;
    
    // Risk level scoring
    switch (report.risk_level.toLowerCase()) {
      case 'high': score += 30; break;
      case 'moderate': score += 15; break;
      case 'low': score += 5; break;
    }
    
    // Urgency scoring
    switch (report.urgency.toLowerCase()) {
      case 'emergent': score += 25; break;
      case 'urgent': score += 15; break;
      case 'routine': score += 5; break;
    }
    
    // Severity scoring
    switch (report.severity_level.toLowerCase()) {
      case 'severe': score += 20; break;
      case 'moderate': score += 10; break;
      case 'mild': score += 5; break;
    }
    
    // Time-based scoring (older reports get higher priority)
    const hoursSinceCreated = Math.floor((new Date().getTime() - new Date(report.created_at).getTime()) / (1000 * 60 * 60));
    score += Math.min(hoursSinceCreated * 2, 20);
    
    return Math.min(score, 100);
  };

  const priorityScore = getPriorityScore();

  if (compact) {
    return (
      <div 
        className={`bg-white rounded-lg border-2 transition-all duration-200 cursor-pointer ${
          isHovered ? 'shadow-lg scale-[1.02] border-blue-300' : 'shadow-sm border-gray-200'
        } ${report.risk_level === 'high' ? 'ring-2 ring-red-100' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onReview(report.id)}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">#{report.patient_id}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRiskLevelColor(report.risk_level)}`}>
                {report.risk_level.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500">{getTimeSinceCreated(report.created_at)}</span>
              <div className={`w-3 h-3 rounded-full ${priorityScore > 60 ? 'bg-red-500' : priorityScore > 30 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 truncate">
            {report.chief_complaint || 'No complaint available'}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm">{getSeverityIcon(report.severity_level)}</span>
              <span className="text-xs text-gray-500">{report.severity_level}</span>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(report.urgency)}`}>
              {report.urgency.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-white rounded-lg border-2 transition-all duration-200 ${
        isHovered ? 'shadow-lg scale-[1.02] border-blue-300' : 'shadow-sm border-gray-200'
      } ${report.risk_level === 'high' ? 'ring-2 ring-red-100' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-semibold text-gray-900">
              Patient #{report.patient_id}
            </h3>
            
            {/* Risk Level Badge */}
            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getRiskLevelColor(report.risk_level)}`}>
              {report.risk_level.toUpperCase()} RISK
            </span>
            
            {/* Urgency Badge */}
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getUrgencyColor(report.urgency)}`}>
              {report.urgency.toUpperCase()}
            </span>
          </div>
          
          {/* Priority Indicator */}
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-xs text-gray-500">Priority</div>
              <div className={`text-sm font-medium ${
                priorityScore > 60 ? 'text-red-600' : 
                priorityScore > 30 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {priorityScore}/100
              </div>
            </div>
            <div className={`w-4 h-4 rounded-full ${
              priorityScore > 60 ? 'bg-red-500' : 
              priorityScore > 30 ? 'bg-yellow-500' : 'bg-green-500'
            }`}></div>
          </div>
        </div>
        
        {/* Chief Complaint */}
        <p className="text-gray-700 text-sm leading-relaxed">
          {report.chief_complaint || 'No chief complaint available'}
        </p>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Severity</div>
            <div className="flex items-center justify-center space-x-1">
              <span className="text-lg">{getSeverityIcon(report.severity_level)}</span>
              <span className="text-sm font-medium text-gray-900 capitalize">
                {report.severity_level}
              </span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Created</div>
            <div className="text-sm font-medium text-gray-900">
              {new Date(report.created_at).toLocaleDateString()}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Time Since</div>
            <div className="text-sm font-medium text-gray-900">
              {getTimeSinceCreated(report.created_at)}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</div>
            <div className="text-sm font-medium text-blue-600">
              Pending Review
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onReview(report.id)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <span>👁️</span>
              <span>Review Report</span>
            </button>
            
            <button
              onClick={() => onAddNotes(report.id)}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              <span>📝</span>
              <span>Add Notes</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onAssignFollowUp(report.id)}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <span>📅</span>
              <span>Follow-up</span>
            </button>
            
            {report.risk_level === 'high' && (
              <div className="flex items-center space-x-1 text-red-600">
                <span className="text-lg">🚨</span>
                <span className="text-xs font-medium">HIGH PRIORITY</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientReportCard;
