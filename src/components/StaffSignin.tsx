import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomButton } from './foundation/Button';
import { CustomInput } from './foundation/Input';
import { CustomCard } from './foundation/Card';

export default function StaffSignin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Check for demo credentials first
    if (formData.email === 'demo' && formData.password === 'demo') {
      setIsLoading(false);
      navigate('/staff-dashboard');
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      // Mock authentication logic
      if (formData.email === 'admin@psychiatrynow.com') {
        // Super Admin
        navigate('/super-admin-dashboard');
      } else if (formData.email.includes('staff')) {
        // Active staff member
        navigate('/staff-dashboard');
      } else if (formData.email.includes('pending')) {
        // Pending staff member
        setError('Your account is pending approval. Please wait for administrator approval.');
      } else {
        // Invalid credentials
        setError('Invalid email or password. Please try again.');
      }
    }, 1000);
  };

  const isFormValid = formData.email && formData.password;

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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Staff Sign In</h2>
          <p className="text-gray-600">
            Access your staff dashboard
          </p>
        </div>

        <CustomCard className="bg-white shadow-lg border-0 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <CustomInput
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <CustomInput
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </button>
            </div>

            <CustomButton
              type="submit"
              variant="primary"
              disabled={!isFormValid || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-medium disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </CustomButton>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Demo Credentials:</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Quick Demo:</strong> demo / demo</p>
              <p><strong>Super Admin:</strong> admin@psychiatrynow.com</p>
              <p><strong>Active Staff:</strong> staff@psychiatrynow.com</p>
              <p><strong>Pending Staff:</strong> pending@psychiatrynow.com</p>
              <p className="text-xs text-gray-500">Use any password for demo (except quick demo)</p>
            </div>
          </div>
        </CustomCard>

        <div className="text-center text-sm text-gray-500">
          <p>Don't have an account? <button onClick={() => navigate('/staff-signup')} className="text-blue-600 hover:text-blue-700">Apply to join our staff</button></p>
        </div>

        {/* Status Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> Staff accounts require approval from a Super Admin before access is granted.
          </p>
        </div>
      </div>
    </div>
  );
}