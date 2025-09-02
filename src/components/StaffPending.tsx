import { useNavigate } from 'react-router-dom';
import { CustomButton } from './foundation/Button';
import { CustomCard } from './foundation/Card';

export default function StaffPending() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mb-8">
            <button 
              onClick={() => navigate('/')} 
              className="text-2xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              PsychiatryNow
            </button>
          </div>
        </div>

        <CustomCard className="bg-white shadow-lg border-0 rounded-2xl p-8 text-center">
          {/* Pending Icon */}
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl text-yellow-600">⏳</span>
          </div>

          {/* Title and Message */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Application Pending
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for signing up. Your account is pending approval by a Super Admin. 
            You will be notified once approved.
          </p>

          {/* Status Details */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 font-medium">Status:</span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                Pending Approval
              </span>
            </div>
          </div>

          {/* What's Next */}
          <div className="text-left mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Super Admin will review your application
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                You'll receive an email notification about approval
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Once approved, you can sign in to your dashboard
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-500 mb-4">
              Questions about your application?
            </p>
            <p className="text-sm text-gray-600">
              Contact us at <span className="text-blue-600">admin@psychiatrynow.com</span>
            </p>
          </div>
        </CustomCard>

        {/* Back to Home */}
        <div className="text-center">
          <CustomButton
            variant="secondary"
            onClick={() => navigate('/')}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Back to Home
          </CustomButton>
        </div>

        {/* Sign in attempt notice */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-sm text-red-700">
            <strong>Note:</strong> Login is disabled until your account is approved by an administrator.
          </p>
        </div>
      </div>
    </div>
  );
}