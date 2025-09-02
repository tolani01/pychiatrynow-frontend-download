import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomButton } from './foundation/Button';
import { CustomCard } from './foundation/Card';
import { CustomInput } from './foundation/Input';

export default function ProviderSignin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for demo credentials
    if (formData.email === 'demo' && formData.password === 'demo') {
      navigate('/provider-dashboard');
      return;
    }
    
    if (validateForm()) {
      // Handle signin logic here
      console.log('Provider signin data:', formData);
      navigate('/provider-dashboard');
    }
  };

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
          <h2 className="text-3xl font-bold text-gray-900">Provider Sign In</h2>
          <p className="mt-2 text-gray-600">Access your provider dashboard</p>
        </div>

        <CustomCard className="bg-white shadow-lg border-0 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <CustomInput
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full ${errors.email ? 'border-red-300' : ''}`}
                placeholder="Enter your email"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <CustomInput
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full ${errors.password ? 'border-red-300' : ''}`}
                placeholder="Enter your password"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <CustomButton
              type="submit"
              variant="primary"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
            >
              Sign in
            </CustomButton>
          </form>

          {/* Forgot Password */}
          <div className="mt-4 text-center">
            <button className="text-blue-600 hover:text-blue-500 text-sm">
              Forgot password?
            </button>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-300">
            <div className="text-center text-sm text-gray-600">
              <p><strong>Demo Login:</strong> demo / demo</p>
            </div>
          </div>
        </CustomCard>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-gray-600">
            New to PsychiatryNow?{' '}
            <button
              onClick={() => navigate('/provider-signup')}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}