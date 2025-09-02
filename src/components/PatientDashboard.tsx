import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomButton } from './foundation/Button';
import { CustomCard } from './foundation/Card';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [patientName] = useState('Sarah Johnson'); // Mock patient name

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
                  onClick={() => navigate('/patient-intake')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
                >
                  Request Care
                </CustomButton>
                <CustomButton
                  variant="secondary"
                  onClick={() => navigate('/patient-checkin')}
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg"
                >
                  Start Check-In
                </CustomButton>
                <CustomButton
                  variant="secondary"
                  onClick={() => navigate('/resources')}
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg"
                >
                  Explore Resources
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