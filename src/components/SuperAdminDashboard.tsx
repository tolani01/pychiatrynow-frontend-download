import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CustomButton } from './foundation/Button';
import { CustomCard } from './foundation/Card';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'pending' | 'active' | 'revoked';
  dateApplied: string;
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Mock data for staff members
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      role: 'Scheduler',
      status: 'pending',
      dateApplied: '2024-01-15'
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      role: 'Intake Specialist',
      status: 'active',
      dateApplied: '2024-01-10'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@email.com',
      role: 'Support Representative',
      status: 'active',
      dateApplied: '2024-01-08'
    }
  ]);

  const pendingCount = staffMembers.filter(member => member.status === 'pending').length;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'patients', label: 'Patients', icon: '👥' },
    { id: 'providers', label: 'Providers', icon: '🩺' },
    { id: 'staff', label: `Staff ${pendingCount > 0 ? `(${pendingCount})` : ''}`, icon: '👷' },
    { id: 'reports', label: 'Reports', icon: '📋' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const handleStaffAction = (staffId: string, action: 'approve' | 'deny' | 'revoke') => {
    setStaffMembers(prev => prev.map(member => {
      if (member.id === staffId) {
        if (action === 'approve') {
          return { ...member, status: 'active' as const };
        } else if (action === 'revoke') {
          return { ...member, status: 'revoked' as const };
        } else if (action === 'deny') {
          // In a real app, this might remove the member or mark as denied
          return { ...member, status: 'revoked' as const };
        }
      }
      return member;
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'revoked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Notification Center */}
      {pendingCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔔</span>
            <div>
              <h3 className="font-semibold text-yellow-800">New Staff Signup Pending Approval</h3>
              <p className="text-yellow-700 text-sm">
                {pendingCount} new staff member{pendingCount > 1 ? 's' : ''} waiting for approval.
              </p>
            </div>
            <CustomButton
              onClick={() => setActiveTab('staff')}
              className="ml-auto bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2"
            >
              Review
            </CustomButton>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <CustomCard className="p-6 bg-white border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">24</p>
              <p className="text-sm text-gray-600">Active Patients</p>
            </div>
          </div>
        </CustomCard>

        <CustomCard className="p-6 bg-white border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🩺</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">8</p>
              <p className="text-sm text-gray-600">Verified Providers</p>
            </div>
          </div>
        </CustomCard>

        <CustomCard className="p-6 bg-white border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👷</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {staffMembers.filter(s => s.status === 'active').length}
              </p>
              <p className="text-sm text-gray-600">Active Staff</p>
            </div>
          </div>
        </CustomCard>

        <CustomCard className="p-6 bg-white border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-sm text-gray-600">Today's Appointments</p>
            </div>
          </div>
        </CustomCard>
      </div>
    </div>
  );

  const renderStaffManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
        <CustomButton
          onClick={() => navigate('/staff-signup')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
        >
          Invite New Staff
        </CustomButton>
      </div>

      {/* Staff Table */}
      <CustomCard className="bg-white border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 font-medium text-gray-900">Name</th>
                <th className="text-left p-4 font-medium text-gray-900">Email</th>
                <th className="text-left p-4 font-medium text-gray-900">Role</th>
                <th className="text-left p-4 font-medium text-gray-900">Status</th>
                <th className="text-left p-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffMembers.map((member) => (
                <tr key={member.id} className="border-b border-gray-100">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-600">Applied: {member.dateApplied}</p>
                    </div>
                  </td>
                  <td className="p-4 text-gray-700">{member.email}</td>
                  <td className="p-4 text-gray-700">{member.role}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {member.status === 'pending' && (
                        <>
                          <CustomButton
                            onClick={() => handleStaffAction(member.id, 'approve')}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm"
                          >
                            Approve
                          </CustomButton>
                          <CustomButton
                            onClick={() => handleStaffAction(member.id, 'deny')}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-sm"
                          >
                            Deny
                          </CustomButton>
                        </>
                      )}
                      {member.status === 'active' && (
                        <CustomButton
                          onClick={() => handleStaffAction(member.id, 'revoke')}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-sm"
                        >
                          Revoke Access
                        </CustomButton>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CustomCard>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'staff':
        return renderStaffManagement();
      case 'patients':
        return <div className="text-center py-12 text-gray-500">Patient management coming soon...</div>;
      case 'providers':
        return <div className="text-center py-12 text-gray-500">Provider verification coming soon...</div>;
      case 'reports':
        return <div className="text-center py-12 text-gray-500">Reports coming soon...</div>;
      case 'settings':
        return <div className="text-center py-12 text-gray-500">System settings coming soon...</div>;
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
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                Super Admin
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Admin User</span>
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