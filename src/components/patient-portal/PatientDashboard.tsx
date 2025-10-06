import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarDaysIcon, 
  DocumentTextIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  BellIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface Appointment {
  id: number;
  type: string;
  status: string;
  scheduled_start: string;
  scheduled_end: string;
  duration_minutes: number;
  location_type: string;
  provider_name: string;
  can_cancel: boolean;
  can_reschedule: boolean;
}

interface HealthRecord {
  intake_reports: Array<{
    id: number;
    created_at: string;
    risk_level: string;
    urgency: string;
    severity_level: string;
    summary: string;
  }>;
  intake_sessions: Array<{
    id: number;
    created_at: string;
    status: string;
    completed_at: string | null;
    duration_minutes: number | null;
  }>;
  total_reports: number;
  total_sessions: number;
}

interface PendingTask {
  type: string;
  title: string;
  description: string;
  due_date: string | null;
  priority: string;
  session_id?: string;
  appointment_id?: number;
  progress?: {
    percentage: number;
    conversation_messages: number;
    completed_screeners: number;
    current_phase: string;
  };
}

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  priority: string;
  is_read: boolean;
  created_at: string;
}

interface DashboardData {
  upcoming_appointments: Appointment[];
  recent_appointments: Appointment[];
  health_records: HealthRecord;
  pending_tasks: PendingTask[];
  notifications: Notification[];
  dashboard_summary: {
    next_appointment: Appointment | null;
    total_upcoming: number;
    total_recent: number;
    pending_tasks: number;
    high_priority_tasks: number;
    has_urgent_tasks: boolean;
  };
}

const PatientDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/v1/patient-portal/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleAppointment = () => {
    navigate('/patient-portal/appointments/new');
  };

  const handleViewHealthRecords = () => {
    navigate('/patient-portal/health-records');
  };

  const handleCompleteIntake = (sessionId: string) => {
    navigate(`/intake?session=${sessionId}`);
  };

  const handleConfirmAppointment = async (appointmentId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/v1/patient-portal/appointments/${appointmentId}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchDashboardData(); // Refresh data
      }
    } catch (err) {
      console.error('Failed to confirm appointment:', err);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-50';
      case 'scheduled': return 'text-blue-600 bg-blue-50';
      case 'completed': return 'text-gray-600 bg-gray-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
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
          <XCircleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading dashboard</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back! Here's your health overview.
              </p>
            </div>
            <button
              onClick={handleScheduleAppointment}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Schedule Appointment
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CalendarDaysIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Upcoming Appointments</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.dashboard_summary.total_upcoming}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Health Reports</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.health_records.total_reports}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Tasks</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.dashboard_summary.pending_tasks}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BellIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Notifications</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.notifications.filter(n => !n.is_read).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Next Appointment */}
          {dashboardData.dashboard_summary.next_appointment && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Next Appointment</h3>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {dashboardData.dashboard_summary.next_appointment.type}
                    </p>
                    <p className="text-sm text-gray-500">
                      with {dashboardData.dashboard_summary.next_appointment.provider_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDateTime(dashboardData.dashboard_summary.next_appointment.scheduled_start)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(dashboardData.dashboard_summary.next_appointment.status)}`}>
                    {dashboardData.dashboard_summary.next_appointment.status}
                  </span>
                </div>
                {dashboardData.dashboard_summary.next_appointment.status === 'scheduled' && (
                  <button
                    onClick={() => handleConfirmAppointment(dashboardData.dashboard_summary.next_appointment!.id)}
                    className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    Confirm Appointment
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Pending Tasks */}
          {dashboardData.pending_tasks.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Pending Tasks</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {dashboardData.pending_tasks.slice(0, 3).map((task) => (
                    <div key={`${task.type}-${task.appointment_id || task.session_id}`} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{task.title}</p>
                          <p className="text-sm text-gray-500">{task.description}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      {task.type === 'complete_intake' && task.session_id && (
                        <button
                          onClick={() => handleCompleteIntake(task.session_id!)}
                          className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Complete Assessment →
                        </button>
                      )}
                      {task.type === 'confirm_appointment' && task.appointment_id && (
                        <button
                          onClick={() => handleConfirmAppointment(task.appointment_id!)}
                          className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Confirm Appointment →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {dashboardData.pending_tasks.length > 3 && (
                  <button
                    onClick={() => navigate('/patient-portal/tasks')}
                    className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View all tasks ({dashboardData.pending_tasks.length})
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Appointments */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Upcoming Appointments</h3>
                <button
                  onClick={() => navigate('/patient-portal/appointments')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
            </div>
            <div className="p-6">
              {dashboardData.upcoming_appointments.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.upcoming_appointments.slice(0, 3).map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {appointment.type} with {appointment.provider_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDateTime(appointment.scheduled_start)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {appointment.location_type === 'virtual' ? 'Virtual Appointment' : appointment.location_type}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming appointments</h3>
                  <p className="mt-1 text-sm text-gray-500">Schedule an appointment to get started.</p>
                  <button
                    onClick={handleScheduleAppointment}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Schedule Appointment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Health Records Summary */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Recent Health Records</h3>
                <button
                  onClick={handleViewHealthRecords}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
            </div>
            <div className="p-6">
              {dashboardData.health_records.intake_reports.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.health_records.intake_reports.slice(0, 3).map((report) => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Assessment Report - {new Date(report.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">{report.summary}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          report.risk_level === 'high' ? 'text-red-600 bg-red-50' :
                          report.risk_level === 'medium' ? 'text-yellow-600 bg-yellow-50' :
                          'text-green-600 bg-green-50'
                        }`}>
                          {report.risk_level} risk
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No health records yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Complete an assessment to generate your first health record.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
