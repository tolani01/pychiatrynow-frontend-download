import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomButton } from './foundation/Button';
import { CustomCard } from './foundation/Card';

export default function ProviderIntakeSummary() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');

  // Mock patient data
  const patientData = {
    name: 'Maria Santos',
    age: 28,
    state: 'CA',
    submittedAt: '2 hours ago'
  };

  // Mock AI summary data
  const aiSummary = {
    keyConcerns: [
      'Persistent depressed mood for 6 weeks',
      'Significant anxiety around work performance',
      'Difficulty sleeping and concentrating',
      'Loss of interest in previously enjoyed activities'
    ],
    riskFlags: [
      {
        level: 'moderate',
        description: 'Patient endorsed passive suicidal thoughts but no plan or intent'
      },
      {
        level: 'low',
        description: 'History of anxiety but no previous psychiatric hospitalization'
      }
    ],
    diagnosticResults: [
      {
        test: 'PHQ-9',
        score: 16,
        interpretation: 'Moderately severe depression',
        details: 'Score indicates significant depressive symptoms interfering with daily functioning'
      },
      {
        test: 'GAD-7',
        score: 14,
        interpretation: 'Moderate anxiety',
        details: 'Score suggests clinically significant anxiety symptoms'
      },
      {
        test: 'ASRS-5',
        score: 12,
        interpretation: 'Possible ADHD',
        details: 'Score indicates potential attention difficulties warranting further evaluation'
      }
    ],
    recommendations: [
      'Consider antidepressant medication (SSRI/SNRI)',
      'Refer for cognitive behavioral therapy',
      'Safety planning discussion required',
      'Follow-up in 1-2 weeks to monitor response'
    ]
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleAcceptPatient = () => {
    // Handle accepting patient logic
    console.log('Patient accepted');
    navigate('/provider-dashboard');
  };

  const handleRequestMoreInfo = () => {
    // Handle requesting more info logic
    console.log('Requesting more information');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <CustomButton
                variant="secondary"
                onClick={() => navigate('/provider-dashboard')}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2"
              >
                ← Back to Dashboard
              </CustomButton>
              <h1 className="text-xl font-semibold text-gray-900">Patient Intake Summary</h1>
            </div>
            
            <div className="text-xl font-semibold text-blue-600">PsychiatryNow</div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Patient Basic Info */}
            <CustomCard className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Patient Information</h2>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-lg font-semibold text-gray-900">{patientData.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Age</p>
                  <p className="text-lg font-semibold text-gray-900">{patientData.age}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">State</p>
                  <p className="text-lg font-semibold text-gray-900">{patientData.state}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Submitted</p>
                  <p className="text-lg font-semibold text-gray-900">{patientData.submittedAt}</p>
                </div>
              </div>
            </CustomCard>

            {/* AI-Generated Summary */}
            <CustomCard className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-2xl">🤖</span>
                <h2 className="text-xl font-semibold text-gray-900">AI-Generated Intake Summary</h2>
              </div>

              {/* Key Concerns */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Concerns</h3>
                <div className="space-y-2">
                  {aiSummary.keyConcerns.map((concern, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <p className="text-gray-700">{concern}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Flags */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Flags</h3>
                <div className="space-y-3">
                  {aiSummary.riskFlags.map((flag, index) => (
                    <div key={index} className={`border rounded-lg p-4 ${getRiskColor(flag.level)}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-semibold uppercase">{flag.level} Risk</span>
                      </div>
                      <p className="text-sm">{flag.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diagnostic Questionnaire Results */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Diagnostic Questionnaire Results</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {aiSummary.diagnosticResults.map((result, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{result.test}</h4>
                        <span className="text-2xl font-bold text-blue-600">{result.score}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-2">{result.interpretation}</p>
                      <p className="text-xs text-gray-600">{result.details}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h3>
                <div className="space-y-2">
                  {aiSummary.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <p className="text-gray-700">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CustomCard>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <CustomButton
                variant="primary"
                onClick={handleAcceptPatient}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold"
              >
                Accept Patient
              </CustomButton>
              <CustomButton
                variant="secondary"
                onClick={handleRequestMoreInfo}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 text-lg font-semibold"
              >
                Request More Info
              </CustomButton>
            </div>
          </div>

          {/* Sidebar - Notes */}
          <div className="lg:col-span-1">
            <CustomCard className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Provider Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={12}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add your notes about this patient's intake summary...

Key observations:
- 
- 

Treatment considerations:
- 
- 

Next steps:
- "
              />
              <CustomButton
                variant="primary"
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2"
              >
                Save Notes
              </CustomButton>
            </CustomCard>
          </div>
        </div>
      </div>
    </div>
  );
}