import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomButton } from './foundation/Button';
import { CustomCard } from './foundation/Card';
import { CustomInput } from './foundation/Input';

export default function ProviderSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    state: '',
    licenseType: '',
    licenseNumber: '',
    password: '',
    confirmPassword: '',
    licenseFile: null,
    confirmAccuracy: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const licenseTypes = [
    'Psychiatrist',
    'PMHNP',
    'PA',
    'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, licenseFile: file }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.licenseType) newErrors.licenseType = 'License type is required';
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.confirmAccuracy) newErrors.confirmAccuracy = 'You must confirm the accuracy of your information';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Handle signup logic here
      console.log('Provider signup data:', formData);
      navigate('/provider-dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
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
          <h2 className="text-3xl font-bold text-gray-900">Join PsychiatryNow as a Provider</h2>
          <p className="mt-2 text-lg text-gray-600">Connect with patients seeking psychiatric care.</p>
        </div>

        <CustomCard className="bg-white shadow-lg border-0 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full name*
              </label>
              <CustomInput
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`w-full ${errors.fullName ? 'border-red-300' : ''}`}
                placeholder="Dr. Jane Smith"
              />
              {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
            </div>

            {/* Email and Phone */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address*
                </label>
                <CustomInput
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full ${errors.email ? 'border-red-300' : ''}`}
                  placeholder="jane.smith@hospital.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone number
                </label>
                <CustomInput
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            {/* State and License Type */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                  State of practice*
                </label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                    errors.state ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select state</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
              </div>

              <div>
                <label htmlFor="licenseType" className="block text-sm font-medium text-gray-700 mb-2">
                  License type*
                </label>
                <select
                  id="licenseType"
                  name="licenseType"
                  value={formData.licenseType}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                    errors.licenseType ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select license type</option>
                  {licenseTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.licenseType && <p className="mt-1 text-sm text-red-600">{errors.licenseType}</p>}
              </div>
            </div>

            {/* License Number */}
            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                License number*
              </label>
              <CustomInput
                id="licenseNumber"
                name="licenseNumber"
                type="text"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                className={`w-full ${errors.licenseNumber ? 'border-red-300' : ''}`}
                placeholder="Enter your license number"
              />
              {errors.licenseNumber && <p className="mt-1 text-sm text-red-600">{errors.licenseNumber}</p>}
            </div>

            {/* Password Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Create password*
                </label>
                <CustomInput
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full ${errors.password ? 'border-red-300' : ''}`}
                  placeholder="Create a secure password"
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm password*
                </label>
                <CustomInput
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full ${errors.confirmPassword ? 'border-red-300' : ''}`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label htmlFor="licenseFile" className="block text-sm font-medium text-gray-700 mb-2">
                Upload a copy of your license or credentials (optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <div className="text-gray-500 mb-3">
                  <span className="text-2xl">📄</span>
                  <p className="text-sm mt-2">Upload PDF, JPG, or PNG (max 10MB)</p>
                </div>
                <input
                  id="licenseFile"
                  name="licenseFile"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <CustomButton
                  type="button"
                  variant="secondary"
                  onClick={() => document.getElementById('licenseFile')?.click()}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Choose File
                </CustomButton>
                {formData.licenseFile && (
                  <p className="mt-2 text-sm text-green-600">
                    ✓ {(formData.licenseFile as File).name}
                  </p>
                )}
              </div>
            </div>

            {/* Confirmation Checkbox */}
            <div className="flex items-start">
              <input
                id="confirmAccuracy"
                name="confirmAccuracy"
                type="checkbox"
                checked={formData.confirmAccuracy}
                onChange={handleInputChange}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="confirmAccuracy" className="ml-2 text-sm text-gray-700">
                I confirm that the information I provided is accurate
              </label>
            </div>
            {errors.confirmAccuracy && <p className="text-sm text-red-600">{errors.confirmAccuracy}</p>}

            {/* Submit Button */}
            <CustomButton
              type="submit"
              variant="primary"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium text-lg"
            >
              Create provider account
            </CustomButton>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/provider-signin')}
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              Already registered? Sign in
            </button>
          </div>
        </CustomCard>

        {/* Trust Indicators */}
        <div className="text-center text-sm text-gray-500">
          <p>Your information is secure and HIPAA-compliant</p>
        </div>
      </div>
    </div>
  );
}