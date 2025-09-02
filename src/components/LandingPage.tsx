import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomButton } from './foundation/Button';
import { ImageWithFallback } from './figma/ImageWithFallback';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isSignInDropdownOpen, setIsSignInDropdownOpen] = useState(false);

  // Custom Clock Icon Component
  const ClockIcon = ({ className }: { className?: string }) => (
    <svg 
      className={className}
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{ display: 'inline' }}
    >
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12,6 12,12 15,12"/>
    </svg>
  );

  // Chevron Down Icon
  const ChevronDownIcon = ({ className }: { className?: string }) => (
    <svg 
      className={className}
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polyline points="6,9 12,15 18,9"/>
    </svg>
  );

  const handleSignInClick = (userType: 'patient' | 'provider' | 'staff') => {
    setIsSignInDropdownOpen(false);
    navigate(`/${userType}-signin`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <div className="relative">
                <span className="text-2xl font-semibold text-gray-900">
                  <span className="relative">P</span>sychiatry<span className="relative">N</span><span className="relative">o</span>w
                </span>
                {/* Stylized elements */}
                <div className="absolute -top-1 left-0 w-4 h-4 border-2 border-blue-500 rounded-full opacity-20"></div>
                <div className="absolute -top-1 right-8 w-3 h-3 border border-blue-500 rounded-full opacity-30">
                  <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-blue-500 rounded-full"></div>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => navigate('/provider-signup')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                For Providers
              </button>
              
              {/* Sign In Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsSignInDropdownOpen(!isSignInDropdownOpen)}
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign In
                  <ChevronDownIcon className={`w-4 h-4 transition-transform ${isSignInDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isSignInDropdownOpen && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-10"
                      onClick={() => setIsSignInDropdownOpen(false)}
                    />
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                      <button
                        onClick={() => handleSignInClick('patient')}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Patient Login
                      </button>
                      <button
                        onClick={() => handleSignInClick('provider')}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Provider Login
                      </button>
                      <button
                        onClick={() => handleSignInClick('staff')}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Staff Login
                      </button>
                    </div>
                  </>
                )}
              </div>
            </nav>

            {/* Mobile Menu - Simple Sign In Button */}
            <div className="md:hidden">
              <div className="relative">
                <button
                  onClick={() => setIsSignInDropdownOpen(!isSignInDropdownOpen)}
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors px-3 py-2"
                >
                  Sign In
                  <ChevronDownIcon className={`w-4 h-4 transition-transform ${isSignInDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isSignInDropdownOpen && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-10"
                      onClick={() => setIsSignInDropdownOpen(false)}
                    />
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                      <button
                        onClick={() => handleSignInClick('patient')}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Patient Login
                      </button>
                      <button
                        onClick={() => handleSignInClick('provider')}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Provider Login
                      </button>
                      <button
                        onClick={() => handleSignInClick('staff')}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Staff Login
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1621887348744-6b0444f8a058?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjBjb25zdWx0YXRpb24lMjBjYWxtfGVufDF8fHx8MTc1NTczOTU5M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Mental health consultation"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-blue-50/80"></div>
        </div>
        
        {/* Content */}
        <div className="relative max-w-6xl mx-auto px-6 py-40 lg:py-48">
          <div className="max-w-2xl text-center mx-auto">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Psychiatric care, when you need it—
              <span className="text-blue-600">
                N
                <ClockIcon className="w-[0.9em] h-[0.9em] inline mx-1 text-blue-600" />
                W
              </span>
              .
            </h1>
            
            <p className="text-xl text-gray-700 mb-16 leading-relaxed">
              AI-guided intake connects you with licensed providers fast.
            </p>
            
            {/* Main CTA */}
            <div className="mb-24">
              <CustomButton 
                variant="primary" 
                onClick={() => navigate('/patient-intake')}
                className="px-12 py-6 text-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl rounded-2xl transition-all duration-200 hover:scale-105"
              >
                Try Our Proprietary AI-Guided Self Assessment
              </CustomButton>
            </div>
            
            {/* Trust Statement */}
            <p className="text-sm text-gray-600">
              Your information is private, secure, and HIPAA compliant.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works - Minimal */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple. Fast. Effective.</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-blue-600 font-semibold text-xl">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-3">Complete Assessment</h3>
              <p className="text-gray-600">10-15 minutes of AI-guided questions</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-blue-600 font-semibold text-xl">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-3">Get Matched</h3>
              <p className="text-gray-600">Connected with licensed providers</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-blue-600 font-semibold text-xl">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-3">Start Care</h3>
              <p className="text-gray-600">Begin your treatment journey</p>
            </div>
          </div>
        </div>
      </section>

      {/* For Providers - Simplified */}
      <section className="py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">For Providers</h2>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            Join our network and receive AI-powered intake summaries that save time.
          </p>
          <CustomButton 
            variant="primary" 
            onClick={() => navigate('/provider-signup')}
            className="px-8 py-4 bg-gray-700 hover:bg-gray-800 text-white rounded-xl"
          >
            Join as Provider
          </CustomButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="mb-8">
            <div className="relative inline-block">
              <span className="text-xl font-semibold text-gray-900">
                <span className="relative">P</span>sychiatry<span className="relative">N</span><span className="relative">o</span>w
              </span>
              <div className="absolute -top-1 left-0 w-3 h-3 border border-blue-500 rounded-full opacity-20"></div>
              <div className="absolute -top-1 right-6 w-2 h-2 border border-blue-500 rounded-full opacity-30">
                <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center gap-8 mb-8 text-sm text-gray-600">
            <button onClick={() => navigate('/provider-signup')} className="hover:text-gray-900 transition-colors">
              For Providers
            </button>
            <button onClick={() => navigate('/resources')} className="hover:text-gray-900 transition-colors">
              Resources
            </button>
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
          </div>
          
          <p className="text-sm text-gray-500">
            © 2024 PsychiatryNow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}