import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomButton } from './foundation/Button';
import { CustomCard } from './foundation/Card';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'patients', label: 'Patients', icon: '👥' },
    { id: 'providers', label: 'Providers', icon: '🩺' },
    { id: 'scheduling', label: 'Scheduling', icon: '📅' },
    { id: 'messages', label: 'Messages', icon: '💬' },
    { id: 'alerts', label: 'Alerts', icon: '🔔' }
  ];

  // Mock data
  const pendingIntakes = [
    { id: '1', patientName: 'John D.', priority: 'High', timeSubmitted: '2 hours ago' },
    { id: '2', patientName: 'Sarah M.', priority: 'Medium', timeSubmitted: '4 hours ago' },
    { id: '3', patientName: 'Michael L.', priority: 'Low', timeSubmitted: '6 hours ago' }
  ];

  const upcomingAppointments = [
    { id: '1', patient: 'Emma W.', provider: 'Dr. Smith', time: '10:00 AM', type: 'Initial Consultation' },
    { id: '2', patient: 'David R.', provider: 'Dr. Johnson', time: '11:30 AM', type: 'Follow-up' },
    { id: '3', patient: 'Lisa K.', provider: 'Dr. Brown', time: '2:00 PM', type: 'Medication Review' }
  ];

  const systemAlerts = [
    { id: '1', type: 'urgent', message: 'High-risk patient assessment flagged for immediate review', time: '30 min ago' },
    { id: '2', type: 'info', message: 'New provider verification pending approval', time: '2 hours ago' },
    { id: '3', type: 'warning', message: 'Appointment reminder system experiencing delays', time: '4 hours ago' }
  ];

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'bg-red-50 border-red-200 text-red-700';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <CustomCard className="p-6 bg-white border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingIntakes.length}</p>
              <p className="text-sm text-gray-600">Pending Intakes</p>
            </div>
          </div>
        </CustomCard>

        <CustomCard className="p-6 bg-white border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
              <p className="text-sm text-gray-600">Today's Appointments</p>
            </div>
          </div>
        </CustomCard>

        <CustomCard className="p-6 bg-white border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔔</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{systemAlerts.length}</p>
              <p className="text-sm text-gray-600">Active Alerts</p>
            </div>
          </div>
        </CustomCard>

        <CustomCard className="p-6 bg-white border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">7</p>
              <p className="text-sm text-gray-600">Unread Messages</p>
            </div>
          </div>
        </CustomCard>
      </div>

      {/* Widgets */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Intakes Widget */}
        <CustomCard className="bg-white border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Pending Intakes</h3>
              <CustomButton
                onClick={() => setActiveTab('patients')}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                View All
              </CustomButton>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {pendingIntakes.map((intake) => (
              <div key={intake.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{intake.patientName}</p>
                  <p className="text-sm text-gray-600">{intake.timeSubmitted}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(intake.priority)}`}>
                  {intake.priority}
                </span>
              </div>
            ))}
          </div>
        </CustomCard>

        {/* Upcoming Appointments Widget */}
        <CustomCard className="bg-white border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Upcoming Appointments</h3>
              <CustomButton
                onClick={() => setActiveTab('scheduling')}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                View All
              </CustomButton>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="border-l-4 border-blue-500 pl-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{appointment.patient}</p>
                    <p className="text-sm text-gray-600">{appointment.provider} • {appointment.type}</p>
                  </div>
                  <span className="text-sm font-medium text-blue-600">{appointment.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CustomCard>

        {/* System Alerts Widget */}
        <CustomCard className="bg-white border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">System Alerts</h3>
              <CustomButton
                onClick={() => setActiveTab('alerts')}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                View All
              </CustomButton>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {systemAlerts.map((alert) => (
              <div key={alert.id} className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}>
                <p className="text-sm font-medium mb-1">{alert.message}</p>
                <p className="text-xs opacity-75">{alert.time}</p>
              </div>
            ))}
          </div>
        </CustomCard>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'patients':
        return <div className="text-center py-12 text-gray-500">Patient management interface coming soon...</div>;
      case 'providers':
        return <div className="text-center py-12 text-gray-500">Provider management interface coming soon...</div>;
      case 'scheduling':
        return <div className="text-center py-12 text-gray-500">Scheduling interface coming soon...</div>;
      case 'messages':
        return <div className="text-center py-12 text-gray-500">Messaging interface coming soon...</div>;
      case 'alerts':
        return <div className="text-center py-12 text-gray-500">Alerts management interface coming soon...</div>;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-semibold text-gray-900">PsychiatryNow</span>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                Staff
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Quick Action Buttons */}
              <div className="hidden md:flex items-center gap-2">
                <CustomButton
                  onClick={() => setActiveTab('patients')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm"
                >
                  Assign Intake
                </CustomButton>
                <CustomButton
                  onClick={() => setActiveTab('providers')}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 text-sm"
                >
                  Verify Provider
                </CustomButton>
                <CustomButton
                  onClick={() => setActiveTab('messages')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 text-sm"
                >
                  Contact Provider
                </CustomButton>
              </div>
              
              <span className="text-gray-700">Staff User</span>
              <CustomButton
                onClick={() => navigate('/')}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2"
              >
                Sign Out
              </CustomButton>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}