import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomButton } from './foundation/Button';
import { CustomInput } from './foundation/Input';
import { CustomCard } from './foundation/Card';

export default function StaffSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    { value: 'scheduler', label: 'Scheduler' },
    { value: 'intake', label: 'Intake Specialist' },
    { value: 'support', label: 'Support Representative' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      
      // Redirect to pending status page after 2 seconds
      setTimeout(() => {
        navigate('/staff-pending');
      }, 2000);
    }, 1000);
  };

  const isFormValid = formData.fullName && 
                     formData.email && 
                     formData.phone &&
                     formData.role &&
                     formData.password && 
                     formData.password === formData.confirmPassword;

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <CustomCard className="bg-white shadow-lg border-0 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl text-yellow-600">⏳</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your account is pending approval by an Administrator.
            </h2>
            <p className="text-gray-600">
              Redirecting to status page...
            </p>
          </CustomCard>
        </div>
      </div>
    );
  }

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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Join as PsychiatryNow Staff</h2>
          <p className="text-gray-600">
            Apply to join our team and help provide better mental healthcare
          </p>
        </div>

        <CustomCard className="bg-white shadow-lg border-0 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <CustomInput
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="w-full"
              />
            </div>

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
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <CustomInput
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Select your role</option>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
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
                placeholder="Create a secure password"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <CustomInput
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                className="w-full"
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-700">
                <strong>Note:</strong> Your account will need approval from a Super Admin before you can access the platform.
              </p>
            </div>

            <CustomButton
              type="submit"
              variant="primary"
              disabled={!isFormValid || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-medium disabled:opacity-50"
            >
              {isLoading ? 'Submitting Application...' : 'Request Access'}
            </CustomButton>
          </form>
        </CustomCard>

        <div className="text-center text-sm text-gray-500">
          <p>Already have an account? <button onClick={() => navigate('/staff-signin')} className="text-blue-600 hover:text-blue-700">Sign in</button></p>
        </div>
      </div>
    </div>
  );
}