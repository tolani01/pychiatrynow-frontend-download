import { useNavigate } from 'react-router-dom';
import { CustomButton } from './foundation/Button';
import { CustomCard } from './foundation/Card';

export default function SuperAdminOnboarding() {
  const navigate = useNavigate();

  const quickLinks = [
    {
      title: 'Staff Management',
      description: 'Approve, manage, and invite staff members',
      icon: '👥',
      action: () => navigate('/super-admin-dashboard?tab=staff')
    },
    {
      title: 'Provider Verification',
      description: 'Review and verify provider applications',
      icon: '🩺',
      action: () => navigate('/super-admin-dashboard?tab=providers')
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings and permissions',
      icon: '⚙️',
      action: () => navigate('/super-admin-dashboard?tab=settings')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mb-8">
            <span className="text-2xl font-semibold text-gray-900">PsychiatryNow</span>
          </div>
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">👑</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to PsychiatryNow
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            You are the Super Admin.
          </p>
          <p className="text-gray-600">
            From here, you can manage Patients, Providers, and Staff.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid gap-6">
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-4">Quick Actions</h2>
          
          {quickLinks.map((link, index) => (
            <CustomCard key={index} className="bg-white shadow-md border-0 rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer" onClick={link.action}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">{link.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{link.title}</h3>
                  <p className="text-gray-600 text-sm">{link.description}</p>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </CustomCard>
          ))}
        </div>

        {/* Main Dashboard Button */}
        <div className="text-center pt-8">
          <CustomButton
            variant="primary"
            onClick={() => navigate('/super-admin-dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 font-medium"
          >
            Go to Super Admin Dashboard
          </CustomButton>
        </div>

        {/* Additional Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-sm text-blue-700">
            <strong>Your Permissions:</strong> You have full access to all dashboards, user management, system settings, and administrative functions.
          </p>
        </div>
      </div>
    </div>
  );
}