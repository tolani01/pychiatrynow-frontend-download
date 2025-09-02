import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomButton } from './foundation/Button';
import { CustomCard } from './foundation/Card';

export default function PatientCheckin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    mood: '',
    sleepQuality: '',
    medicationAdherence: '',
    mainConcern: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle check-in submission
    console.log('Check-in data:', formData);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <CustomCard className="bg-white shadow-lg border-0 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl text-green-600">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank you!</h2>
            <p className="text-gray-600 mb-8">
              Your provider will review this before your session. This helps them understand how you're feeling today.
            </p>
            <div className="space-y-3">
              <CustomButton
                variant="primary"
                onClick={() => navigate('/patient-dashboard')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
              >
                Back to Dashboard
              </CustomButton>
              <CustomButton
                variant="secondary"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg"
              >
                Join Video Session
              </CustomButton>
            </div>
          </CustomCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button 
              onClick={() => navigate('/patient-dashboard')}
              className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              PsychiatryNow
            </button>
            <CustomButton
              variant="secondary"
              onClick={() => navigate('/patient-dashboard')}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2"
            >
              Back to Dashboard
            </CustomButton>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">How are you doing today?</h1>
          <p className="mt-4 text-xl text-gray-600">
            Complete a quick check-in before your appointment. This helps your provider understand how you're feeling.
          </p>
        </div>

        <CustomCard className="bg-white shadow-lg border-0 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Mood Scale */}
            <div>
              <label className="block text-lg font-medium text-gray-900 mb-4">
                Mood today
              </label>
              <div className="space-y-3">
                {[
                  { value: '1', label: 'Very low' },
                  { value: '2', label: 'Low' },
                  { value: '3', label: 'Neutral' },
                  { value: '4', label: 'Good' },
                  { value: '5', label: 'Very good' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="mood"
                      value={option.value}
                      checked={formData.mood === option.value}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-3 text-gray-700">{option.value} - {option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sleep Quality */}
            <div>
              <label className="block text-lg font-medium text-gray-900 mb-4">
                Sleep quality
              </label>
              <div className="space-y-3">
                {[
                  { value: 'poor', label: 'Poor' },
                  { value: 'fair', label: 'Fair' },
                  { value: 'good', label: 'Good' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="sleepQuality"
                      value={option.value}
                      checked={formData.sleepQuality === option.value}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-3 text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Medication Adherence */}
            <div>
              <label className="block text-lg font-medium text-gray-900 mb-4">
                Medication adherence
              </label>
              <div className="space-y-3">
                {[
                  { value: 'yes', label: 'Yes, as prescribed' },
                  { value: 'sometimes', label: 'Sometimes/occasionally missed' },
                  { value: 'no', label: 'No, frequently missed' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="medicationAdherence"
                      value={option.value}
                      checked={formData.medicationAdherence === option.value}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-3 text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Main Concern */}
            <div>
              <label htmlFor="mainConcern" className="block text-lg font-medium text-gray-900 mb-4">
                Main concern today (optional)
              </label>
              <textarea
                id="mainConcern"
                name="mainConcern"
                rows={4}
                value={formData.mainConcern}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Is there anything specific you'd like to discuss with your provider today?"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <CustomButton
                type="submit"
                variant="primary"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg text-lg font-medium"
              >
                Submit Check-In
              </CustomButton>
            </div>
          </form>
        </CustomCard>
      </div>
    </div>
  );
}