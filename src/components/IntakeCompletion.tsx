import { useNavigate } from 'react-router-dom';
import { CustomButton } from './foundation/Button';
import { CustomCard } from './foundation/Card';

export default function IntakeCompletion() {
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
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl text-green-600">✓</span>
          </div>

          {/* Title and Message */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Thank you for completing your intake.
          </h2>
          <p className="text-gray-600 mb-8">
            Please sign up to continue and get matched with a licensed clinical provider as soon as possible.
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <CustomButton
              variant="primary"
              onClick={() => navigate('/patient-intake-summary')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
            >
              View Your Summary
            </CustomButton>
            
            <CustomButton
              variant="primary"
              onClick={() => navigate('/patient-signup')}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium"
            >
              Create Account
            </CustomButton>
            
            <CustomButton
              variant="secondary"
              onClick={() => navigate('/patient-signin')}
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg font-medium"
            >
              Sign In
            </CustomButton>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Your intake information has been securely saved and will be reviewed by a licensed provider.
            </p>
          </div>
        </CustomCard>

        {/* Trust Indicator */}
        <div className="text-center text-sm text-gray-500">
          <p>Your information is secure and HIPAA-compliant</p>
        </div>
      </div>
    </div>
  );
}