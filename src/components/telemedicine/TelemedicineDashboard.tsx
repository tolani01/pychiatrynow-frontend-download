/**
 * Telemedicine Dashboard - Provider interface for managing consultations
 * Displays scheduled sessions, allows starting calls, and manages session history
 */

import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../../contexts/WebSocketContext';

// Types
interface TelemedicineSession {
  session_id: string;
  provider_id: number;
  patient_id: number;
  report_id?: number;
  session_type: string;
  status: 'scheduled' | 'active' | 'ended' | 'cancelled';
  created_at: string;
  started_at?: string;
  ended_at?: string;
  duration_seconds?: number;
}

interface TelemedicineDashboardProps {
  token: string;
  onStartCall?: (sessionId: string) => void;
}

const TelemedicineDashboard: React.FC<TelemedicineDashboardProps> = ({
  token,
  onStartCall
}) => {
  const { isConnected, notifications } = useWebSocket();
  
  // State
  const [sessions, setSessions] = useState<TelemedicineSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'active' | 'completed'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);

  // Load sessions
  useEffect(() => {
    loadSessions();
  }, [token]);

  // Listen for telemedicine notifications
  useEffect(() => {
    const telemedicineNotifications = notifications.filter(
      n => n.type === 'telemedicine_notification'
    );
    
    if (telemedicineNotifications.length > 0) {
      // Refresh sessions when telemedicine events occur
      loadSessions();
    }
  }, [notifications]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/v1/telemedicine/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load sessions');
      }

      const data = await response.json();
      setSessions(data.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
      console.error('Sessions load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (patientId: number, reportId?: number) => {
    try {
      const response = await fetch('/api/v1/telemedicine/sessions/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patient_id: patientId,
          report_id: reportId,
          session_type: 'consultation',
          duration_minutes: 60
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      await loadSessions();
      setShowCreateModal(false);
      setSelectedPatient(null);
      
      return data.data;
    } catch (err) {
      console.error('Create session error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create session');
    }
  };

  const joinSession = async (sessionId: string) => {
    try {
      const response = await fetch('/api/v1/telemedicine/sessions/join', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to join session');
      }

      // Start the video call
      onStartCall?.(sessionId);
    } catch (err) {
      console.error('Join session error:', err);
      setError(err instanceof Error ? err.message : 'Failed to join session');
    }
  };

  const endSession = async (sessionId: string, reason: string = 'completed') => {
    try {
      const response = await fetch('/api/v1/telemedicine/sessions/end', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId,
          reason: reason
        })
      });

      if (!response.ok) {
        throw new Error('Failed to end session');
      }

      await loadSessions();
    } catch (err) {
      console.error('End session error:', err);
      setError(err instanceof Error ? err.message : 'Failed to end session');
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'ended': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'scheduled': return '📅';
      case 'active': return '🟢';
      case 'ended': return '✅';
      case 'cancelled': return '❌';
      default: return '❓';
    }
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const filteredSessions = sessions.filter(session => {
    if (filter === 'all') return true;
    return session.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading telemedicine sessions...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Telemedicine Dashboard</h1>
              <p className="text-gray-600">Manage video consultations and sessions</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                isConnected 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                📹 New Consultation
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            {[
              { key: 'all', label: 'All Sessions' },
              { key: 'scheduled', label: 'Scheduled' },
              { key: 'active', label: 'Active' },
              { key: 'completed', label: 'Completed' }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key as any)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterOption.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-500 text-xl mr-3">⚠️</div>
              <div>
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Sessions List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Sessions ({filteredSessions.length})
            </h2>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">📹</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Sessions Found</h3>
              <p className="text-gray-600">
                {sessions.length === 0 
                  ? "You don't have any telemedicine sessions yet."
                  : "No sessions match your current filter."
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredSessions.map((session) => (
                <div key={session.session_id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          Patient #{session.patient_id}
                        </h3>
                        
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(session.status)}`}>
                          {getStatusIcon(session.status)} {session.status.toUpperCase()}
                        </span>
                        
                        <span className="text-sm text-gray-500">
                          {session.session_type.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <span>Created: {new Date(session.created_at).toLocaleDateString()}</span>
                        {session.started_at && (
                          <span>Started: {new Date(session.started_at).toLocaleString()}</span>
                        )}
                        {session.duration_seconds && (
                          <span>Duration: {formatDuration(session.duration_seconds)}</span>
                        )}
                        {session.report_id && (
                          <span>Report: #{session.report_id}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {session.status === 'scheduled' && (
                        <button
                          onClick={() => joinSession(session.session_id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          📞 Join Call
                        </button>
                      )}
                      
                      {session.status === 'active' && (
                        <button
                          onClick={() => joinSession(session.session_id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          📹 Enter Call
                        </button>
                      )}
                      
                      {(session.status === 'scheduled' || session.status === 'active') && (
                        <button
                          onClick={() => endSession(session.session_id, 'cancelled')}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          ❌ Cancel
                        </button>
                      )}
                      
                      <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm">
                        👁️ View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCreateModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    📹
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Create New Consultation
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Start a new video consultation with a patient.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient ID
                  </label>
                  <input
                    type="number"
                    value={selectedPatient || ''}
                    onChange={(e) => setSelectedPatient(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter patient ID"
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => selectedPatient && createSession(selectedPatient)}
                  disabled={!selectedPatient}
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Session
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TelemedicineDashboard;
