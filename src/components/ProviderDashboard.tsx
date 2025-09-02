import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomButton } from './foundation/Button';
import { CustomCard } from './foundation/Card';

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const [providerName] = useState('Dr. Sarah Mitchell'); // Mock provider name

  // Mock data
  const nextAppointment = {
    date: 'Today, 3:00 PM',
    patient: 'John D.',
    type: 'Initial Consultation'
  };

  const pendingIntakes = [
    { id: 1, patient: 'Maria S.', age: 28, state: 'CA', submitted: '2 hours ago' },
    { id: 2, patient: 'David L.', age: 34, state: 'CA', submitted: '4 hours ago' },
    { id: 3, patient: 'Jennifer R.', age: 22, state: 'CA', submitted: '1 day ago' }
  ];

  const recentMessages = [
    { id: 1, patient: 'Emily C.', message: 'Question about medication timing', time: '1 hour ago' },
    { id: 2, patient: 'Robert M.', message: 'Appointment rescheduling request', time: '3 hours ago' }
  ];

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
              <button className="text-blue-600 font-medium">Patients</button>
              <button className="text-gray-600 hover:text-gray-900">Appointments</button>
              <button className="text-gray-600 hover:text-gray-900">Messages</button>
              <button className="text-gray-600 hover:text-gray-900">Profile</button>
            </nav>

            {/* Profile Menu */}
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">
                  {providerName.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome {providerName}</h1>
          <p className="mt-2 text-gray-600">Here's your patient overview for today.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Next Appointment */}
            <CustomCard className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your next appointment</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium text-gray-900">{nextAppointment.date}</p>
                  <p className="text-gray-600">Patient: {nextAppointment.patient}</p>
                  <p className="text-gray-600">{nextAppointment.type}</p>
                </div>
                <div className="flex flex-col space-y-2">
                  <CustomButton
                    variant="primary"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                  >
                    Join Session
                  </CustomButton>
                  <CustomButton
                    variant="secondary"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 text-sm"
                  >
                    View Details
                  </CustomButton>
                </div>
              </div>
            </CustomCard>

            {/* Pending Intakes */}
            <CustomCard className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Pending Intakes</h2>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                  {pendingIntakes.length} new
                </span>
              </div>
              <div className="space-y-4">
                {pendingIntakes.map((intake) => (
                  <div key={intake.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                    <div>
                      <h3 className="font-medium text-gray-900">{intake.patient}</h3>
                      <p className="text-sm text-gray-600">Age {intake.age} • {intake.state} • Submitted {intake.submitted}</p>
                    </div>
                    <CustomButton
                      variant="primary"
                      onClick={() => navigate('/provider-intake-summary')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
                    >
                      View Summary
                    </CustomButton>
                  </div>
                ))}
              </div>
            </CustomCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Messages */}
            <CustomCard className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Messages</h3>
              <div className="space-y-3">
                {recentMessages.map((message) => (
                  <div key={message.id} className="border-l-4 border-blue-200 pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900 text-sm">{message.patient}</span>
                      <span className="text-xs text-gray-500">{message.time}</span>
                    </div>
                    <p className="text-sm text-gray-600">{message.message}</p>
                  </div>
                ))}
              </div>
              <CustomButton
                variant="secondary"
                className="w-full mt-4 border-gray-300 text-gray-700 hover:bg-gray-50 py-2 text-sm"
              >
                View All Messages
              </CustomButton>
            </CustomCard>

            {/* Profile Verification */}
            <CustomCard className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Verification</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Medical License</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">DEA Certificate</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Malpractice Insurance</span>
                </div>
              </div>
              <CustomButton
                variant="secondary"
                className="w-full mt-4 border-gray-300 text-gray-700 hover:bg-gray-50 py-2 text-sm"
              >
                Update Documents
              </CustomButton>
            </CustomCard>

            {/* Quick Stats */}
            <CustomCard className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">Appointments</span>
                  <span className="font-semibold text-gray-900">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">New Patients</span>
                  <span className="font-semibold text-gray-900">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Messages</span>
                  <span className="font-semibold text-gray-900">8</span>
                </div>
              </div>
            </CustomCard>
          </div>
        </div>
      </main>
    </div>
  );
}