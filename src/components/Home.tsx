import { useNavigate } from 'react-router-dom';
import { CustomButton } from './foundation/Button';
import { CustomCard } from './foundation/Card';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold text-gray-900 mb-4">PsychiatryNow</h1>
          <p className="text-lg text-gray-600">Telepsychiatry MVP Demo</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CustomCard className="p-6">
            <h2 className="text-xl font-semibold mb-4">Patient Flows</h2>
            <div className="space-y-3">
              <CustomButton 
                variant="primary" 
                onClick={() => navigate('/patient-intake')}
                className="w-full"
              >
                Patient Intake Chat
              </CustomButton>
              <CustomButton 
                variant="secondary" 
                onClick={() => navigate('/patient-dashboard')}
                className="w-full"
              >
                Patient Dashboard
              </CustomButton>
            </div>
          </CustomCard>

          <CustomCard className="p-6">
            <h2 className="text-xl font-semibold mb-4">Provider Flows</h2>
            <div className="space-y-3">
              <CustomButton 
                variant="primary" 
                onClick={() => navigate('/provider-dashboard')}
                className="w-full"
              >
                Provider Dashboard
              </CustomButton>
              <CustomButton 
                variant="secondary" 
                onClick={() => navigate('/provider-signup')}
                className="w-full"
              >
                Provider Signup
              </CustomButton>
            </div>
          </CustomCard>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Select a flow above to explore the PsychiatryNow MVP prototype
          </p>
        </div>
      </div>
    </div>
  );
}