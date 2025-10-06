import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomButton } from './foundation/Button';
import { CustomCard } from './foundation/Card';
import { CustomInput } from './foundation/Input';

export default function PatientSignin() {
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for demo credentials - use real backend
    if (formData.email === 'demo@demo.com' && formData.password === 'demo') {
      try {
        // First, create demo user if it doesn't exist
        await fetch(`${apiBase}/api/v1/auth/create-demo-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        
        // Then login with demo credentials
        const res = await fetch(`${apiBase}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: 'demo@demo.com', 
            password: 'demo' 
          }),
        });

        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('access_token', data.access_token);
          
          // Get user info from /me endpoint
          const userRes = await fetch(`${apiBase}/api/v1/auth/me`, {
            headers: { 'Authorization': `Bearer ${data.access_token}` }
          });
          
          if (userRes.ok) {
            const userData = await userRes.json();
            localStorage.setItem('user_id', userData.id);
            localStorage.setItem('user_role', userData.role);
            localStorage.setItem('user_email', userData.email);
            
            // Store user name (combine first_name and last_name if available)
            if (userData.first_name || userData.last_name) {
              const fullName = [userData.first_name, userData.last_name].filter(Boolean).join(' ');
              localStorage.setItem('user_name', fullName);
            } else if (userData.name) {
              localStorage.setItem('user_name', userData.name);
            }
          }
          
          navigate('/patient-dashboard');
          return;
        }
      } catch (err) {
        console.log('Backend not available, using fallback demo mode');
      }
      
      // Fallback demo mode if backend not available
      localStorage.setItem('access_token', 'demo_token_123');
      localStorage.setItem('user_id', 'demo_user_123');
      localStorage.setItem('user_role', 'patient');
      localStorage.setItem('user_email', 'demo@demo.com');
      localStorage.setItem('user_name', 'Demo User');
      navigate('/patient-dashboard');
      return;
    }
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch(`${apiBase}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email, 
          password: formData.password 
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Login failed');
      }

      const data = await res.json();
      localStorage.setItem('access_token', data.access_token);
      
      // Get user info from /me endpoint
      const userRes = await fetch(`${apiBase}/api/v1/auth/me`, {
        headers: { 'Authorization': `Bearer ${data.access_token}` }
      });
      
      if (userRes.ok) {
        const userData = await userRes.json();
        localStorage.setItem('user_id', userData.id);
        localStorage.setItem('user_role', userData.role);
        localStorage.setItem('user_email', userData.email);
        
        // Store user name (combine first_name and last_name if available)
        if (userData.first_name || userData.last_name) {
          const fullName = [userData.first_name, userData.last_name].filter(Boolean).join(' ');
          localStorage.setItem('user_name', fullName);
        } else if (userData.name) {
          localStorage.setItem('user_name', userData.name);
        }
      }
      
      navigate('/patient-dashboard');
    } catch (err: any) {
      setErrors({ general: err.message || 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
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
          <h2 className="text-3xl font-bold text-gray-900">Welcome back to PsychiatryNow</h2>
          <p className="mt-2 text-gray-600">Sign in to continue</p>
        </div>

        <CustomCard className="bg-white shadow-lg border-0 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email*
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
                Password*
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
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </CustomButton>
          </form>

          {/* Forgot Password */}
          <div className="mt-4 text-center">
            <button className="text-blue-600 hover:text-blue-500 text-sm">
              Forgot password?
            </button>
          </div>

          {/* Divider */}
          <div className="mt-8 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <div className="px-4 text-sm text-gray-500">New here?</div>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-300">
            <div className="text-center text-sm text-gray-600 mb-4">
              <p><strong>Demo Login:</strong> demo@demo.com / demo</p>
            </div>
          </div>

          {/* Create Account */}
          <div className="mt-6 text-center">
            <CustomButton
              variant="secondary"
              onClick={() => navigate('/patient-signup')}
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg font-medium"
            >
              Create account
            </CustomButton>
          </div>
        </CustomCard>
      </div>
    </div>
  );
}