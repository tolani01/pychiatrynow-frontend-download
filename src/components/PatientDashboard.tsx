import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomButton } from './foundation/Button';
import { CustomCard } from './foundation/Card';

interface PausedSession {
  id: string;
  session_token: string;
  status: string;
  current_phase: string;
  resume_token: string | null;
  paused_at: string | null;
  expires_at: string | null;
  completed_screeners: string[];
}

interface CompletedReport {
  id: string;
  patient_id: string;
  severity_level: string | null;
  risk_level: string | null;
  urgency: string | null;
  created_at: string;
  chief_complaint: string | null;
}

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [patientName, setPatientName] = useState('Guest');
  const [pausedSession, setPausedSession] = useState<PausedSession | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [completedReports, setCompletedReports] = useState<CompletedReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  // Load user name from localStorage
  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    const storedEmail = localStorage.getItem('user_email');
    
    if (storedName) {
      setPatientName(storedName);
    } else if (storedEmail) {
      // If no name is stored, use email as fallback
      setPatientName(storedEmail.split('@')[0]);
    }
  }, []);

  // Fetch paused sessions and completed reports
  useEffect(() => {
    fetchPausedSessions();
    fetchCompletedReports();
  }, []);

  const fetchCompletedReports = async () => {
    const token = localStorage.getItem('access_token');
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
    
    // For authenticated users - fetch all their reports
    if (token) {
      try {
        const res = await fetch(`${apiBase}/api/v1/reports/me?limit=3`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const reports = await res.json();
          setCompletedReports(reports);
        }
      } catch (error) {
        console.error('Error fetching authenticated reports:', error);
      }
    } else {
      // For anonymous users - check localStorage for last report
      const lastReportId = localStorage.getItem('last_report_id');
      
      if (lastReportId) {
        try {
          // Fetch the specific report by ID (no auth required for own report via session)
          const res = await fetch(`${apiBase}/api/v1/reports/${lastReportId}`);
          
          if (res.ok) {
            const report = await res.json();
            setCompletedReports([report]);
          } else {
            // Report not found or expired, clear from localStorage
            localStorage.removeItem('last_report_id');
            localStorage.removeItem('last_report_date');
          }
        } catch (error) {
          console.error('Error fetching anonymous report:', error);
          localStorage.removeItem('last_report_id');
        }
      }
    }
    
    setLoadingReports(false);
  };

  const fetchPausedSessions = async () => {
    const token = localStorage.getItem('access_token');
    
    // Also check localStorage for anonymous paused session
    const localPaused = localStorage.getItem('paused_session');
    if (localPaused) {
      try {
        const parsed = JSON.parse(localPaused);
        const expiresAt = new Date(parsed.expires_at);
        if (expiresAt > new Date()) {
          setPausedSession({
            id: parsed.session_token,
            session_token: parsed.session_token,
            status: 'paused',
            current_phase: 'unknown',
            resume_token: parsed.resume_token,
            paused_at: parsed.paused_at,
            expires_at: parsed.expires_at,
            completed_screeners: parsed.completed_screeners || []
          });
          setLoadingSessions(false);
          return;
        } else {
          // Expired, clear it
          localStorage.removeItem('paused_session');
        }
      } catch (e) {
        console.error('Error parsing local paused session:', e);
      }
    }
    
    // If authenticated, fetch from backend
    if (token) {
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
        const res = await fetch(`${apiBase}/api/v1/intake/sessions/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          const paused = data.sessions.find((s: PausedSession) => s.status === 'paused');
          if (paused) {
            setPausedSession(paused);
          }
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    }
    
    setLoadingSessions(false);
  };

  const handleResumeAssessment = () => {
    // Navigate to intake page with state indicating intentional resume
    navigate('/patient-intake', { state: { autoResume: true } });
  };

  // Mock data
  const nextAppointment = {
    date: 'Today, 2:00 PM',
    provider: 'Dr. Michael Chen',
    type: 'Follow-up Session'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/')}
                className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
              >
                PsychiatryNow
              </button>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button className="text-blue-600 font-medium">Appointments</button>
              <button className="text-gray-600 hover:text-gray-900">Medications</button>
              <button className="text-gray-600 hover:text-gray-900">Messages</button>
              <button 
                onClick={() => navigate('/resources')}
                className="text-gray-600 hover:text-gray-900"
              >
                Resources
              </button>
              <button 
                onClick={() => navigate('/patient-checkin')}
                className="text-gray-600 hover:text-gray-900"
              >
                Check-In
              </button>
            </nav>

            {/* Profile Menu */}
            <div className="flex items-center space-x-4">
              <CustomButton
                variant="secondary"
                onClick={() => {
                  localStorage.removeItem('access_token');
                  localStorage.removeItem('user_role');
                  navigate('/patient-signin');
                }}
                className="text-sm px-3 py-1.5"
              >
                Sign Out
              </CustomButton>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">
                  {patientName.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {patientName}</h1>
          <p className="mt-2 text-gray-600">Here's what's happening with your care today.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Paused Assessment Card */}
            {pausedSession && !loadingSessions && (
              <CustomCard className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <h2 className="text-xl font-semibold text-gray-900">Assessment In Progress</h2>
                    </div>
                    <p className="text-gray-700 mb-3">
                      You have a paused mental health assessment. Continue where you left off.
                    </p>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Paused:</span>{' '}
                        {pausedSession.paused_at 
                          ? new Date(pausedSession.paused_at).toLocaleString()
                          : 'Recently'
                        }
                      </p>
                      {pausedSession.completed_screeners.length > 0 && (
                        <p>
                          <span className="font-medium">Progress:</span>{' '}
                          {pausedSession.completed_screeners.length} screeners completed
                        </p>
                      )}
                      {pausedSession.expires_at && (
                        <p>
                          <span className="font-medium">Expires:</span>{' '}
                          {new Date(pausedSession.expires_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <CustomButton
                      variant="primary"
                      onClick={handleResumeAssessment}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 whitespace-nowrap"
                    >
                      Resume Assessment
                    </CustomButton>
                  </div>
                </div>
              </CustomCard>
            )}
            
            {/* Sign In Prompt for Anonymous Users */}
            {!localStorage.getItem('access_token') && completedReports.length > 0 && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 mb-1">💾 Save Your Assessments Permanently</h3>
                    <p className="text-sm text-amber-800 mb-3">
                      You're viewing your most recent assessment. Sign in to save all your reports and track your progress over time.
                    </p>
                  </div>
                  <CustomButton
                    variant="primary"
                    onClick={() => navigate('/patient-signin')}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 whitespace-nowrap"
                  >
                    Sign In
                  </CustomButton>
                </div>
              </div>
            )}
            
            {/* Completed Assessments */}
            {!loadingReports && completedReports.length > 0 && (
              <CustomCard className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {localStorage.getItem('access_token') ? 'Recent Assessments' : 'Your Latest Assessment'}
                </h2>
                <div className="space-y-4">
                  {completedReports.map((report, idx) => {
                    const getRiskColor = (risk: string | null) => {
                      if (!risk) return 'gray';
                      if (risk.toLowerCase() === 'high') return 'red';
                      if (risk.toLowerCase() === 'moderate') return 'orange';
                      return 'green';
                    };
                    
                    const riskColor = getRiskColor(report.risk_level);
                    
                    return (
                      <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-gray-700 font-medium">
                                📋 {new Date(report.created_at).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit'
                                })}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${riskColor}-100 text-${riskColor}-800`}>
                                {report.risk_level || 'N/A'} Risk
                              </span>
                            </div>
                            {report.chief_complaint && (
                              <p className="text-sm text-gray-600 mb-2">
                                {report.chief_complaint}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>Severity: {report.severity_level || 'N/A'}</span>
                              <span>•</span>
                              <span>Urgency: {report.urgency || 'N/A'}</span>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2 ml-4">
                            <CustomButton
                              variant="primary"
                              onClick={() => navigate(`/patient-intake-summary?report_id=${report.id}`)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm whitespace-nowrap"
                            >
                              View Report
                            </CustomButton>
                            <CustomButton
                              variant="secondary"
                              onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/v1/reports/${report.id}/pdf`, '_blank')}
                              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 text-sm whitespace-nowrap"
                            >
                              Download PDF
                            </CustomButton>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {completedReports.length === 3 && (
                  <div className="mt-4 text-center">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View All Assessments →
                    </button>
                  </div>
                )}
              </CustomCard>
            )}
            
            {/* Next Appointment Card */}
            <CustomCard className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Next Appointment</h2>
                  <div className="space-y-2">
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-900">{nextAppointment.date}</span>
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-900">{nextAppointment.provider}</span>
                    </p>
                    <p className="text-gray-600">{nextAppointment.type}</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <CustomButton
                    variant="primary"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm"
                  >
                    Join Video Session
                  </CustomButton>
                  <CustomButton
                    variant="secondary"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 text-sm"
                  >
                    View Details
                  </CustomButton>
                </div>
              </div>
            </CustomCard>

            {/* Recent Activity */}
            <CustomCard className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-gray-900 font-medium">Check-in completed</p>
                    <p className="text-sm text-gray-600">Today, 1:30 PM</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-gray-900 font-medium">Medication refill approved</p>
                    <p className="text-sm text-gray-600">Yesterday, 11:20 AM</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-gray-900 font-medium">New message from Dr. Chen</p>
                    <p className="text-sm text-gray-600">Dec 19, 3:45 PM</p>
                  </div>
                </div>
              </div>
            </CustomCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Links */}
            <CustomCard className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <CustomButton
                  variant="primary"
                  onClick={() => navigate('/patient-intake', { state: { userName: patientName } })}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
                >
                  🤖 Start Assessment with Ava
                </CustomButton>
                <CustomButton
                  variant="secondary"
                  onClick={() => navigate('/patient-checkin')}
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg"
                >
                  ✅ Start Pre-Appointment Check-In
                </CustomButton>
                <div className="relative group">
                  <CustomButton
                    variant="secondary"
                    disabled
                    className="w-full border-gray-300 text-gray-400 bg-gray-50 py-3 rounded-lg cursor-not-allowed"
                  >
                    📅 Request Appointment
                  </CustomButton>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-gray-900 text-white text-xs px-3 py-1 rounded shadow-lg -mt-12">
                      Coming soon!
                    </div>
                  </div>
                </div>
                <CustomButton
                  variant="secondary"
                  onClick={() => navigate('/resources')}
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg"
                >
                  📚 Explore Resources
                </CustomButton>
              </div>
            </CustomCard>

            {/* Medications */}
            <CustomCard className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Medications</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <div>
                    <p className="font-medium text-gray-900">Sertraline 50mg</p>
                    <p className="text-sm text-gray-600">Daily, morning</p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div>
                    <p className="font-medium text-gray-900">Lorazepam 0.5mg</p>
                    <p className="text-sm text-gray-600">As needed</p>
                  </div>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                </div>
              </div>
              <CustomButton
                variant="secondary"
                className="w-full mt-4 border-gray-300 text-gray-700 hover:bg-gray-50 py-2 text-sm"
              >
                Request Refill
              </CustomButton>
            </CustomCard>

            {/* Wellness Tip */}
            <CustomCard className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Today's Wellness Tip</h3>
              <p className="text-gray-700 text-sm">
                Try the 5-4-3-2-1 grounding technique when feeling anxious: 
                Notice 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.
              </p>
              <CustomButton
                variant="secondary"
                onClick={() => navigate('/resources')}
                className="w-full mt-4 border-blue-300 text-blue-700 hover:bg-blue-50 py-2 text-sm"
              >
                More Resources
              </CustomButton>
            </CustomCard>
          </div>
        </div>
      </main>
    </div>
  );
}