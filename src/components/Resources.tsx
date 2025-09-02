import { useNavigate } from 'react-router-dom';
import { CustomCard } from './foundation/Card';
import { CustomButton } from './foundation/Button';

export default function Resources() {
  const navigate = useNavigate();

  const resources = [
    {
      title: "Guided Meditation",
      icon: "🧘‍♀️",
      description: "5-15 minute guided meditations for anxiety, sleep, and stress relief.",
      articles: [
        "Morning Mindfulness Routine",
        "Breathing Exercises for Anxiety", 
        "Sleep Meditation Guide"
      ]
    },
    {
      title: "Coping Tools",
      icon: "🛠️",
      description: "Practical techniques and exercises for managing difficult emotions.",
      articles: [
        "Grounding Techniques",
        "Thought Challenging Worksheets",
        "Crisis Management Plan"
      ]
    },
    {
      title: "Educational Articles",
      icon: "📚",
      description: "Evidence-based information about mental health conditions and treatments.",
      articles: [
        "Understanding Depression",
        "Anxiety Disorders Explained",
        "Medication Guide"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="text-gray-600">
              ← Back to Home
            </button>
            <h1 className="text-xl font-medium">Mental Health Resources</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-medium text-gray-900 mb-4">
            Support Beyond Appointments
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Access tools and resources that support your mental health journey between provider visits.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {resources.map((resource, index) => (
            <CustomCard key={index} className="p-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">{resource.icon}</div>
                <h3 className="text-xl font-medium mb-3">{resource.title}</h3>
                <p className="text-gray-600">{resource.description}</p>
              </div>
              
              <div className="space-y-3">
                {resource.articles.map((article, articleIndex) => (
                  <div key={articleIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">{article}</span>
                    <button className="text-blue-600 text-sm hover:text-blue-700">
                      View
                    </button>
                  </div>
                ))}
              </div>
            </CustomCard>
          ))}
        </div>

        <div className="text-center">
          <CustomCard className="p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-medium mb-4">Want Access to More Resources?</h3>
            <p className="text-gray-600 mb-6">
              Sign up as a patient to unlock additional resources, mood tracking tools, and personalized recommendations.
            </p>
            <CustomButton 
              variant="primary" 
              onClick={() => navigate('/patient-intake')}
              className="px-8"
            >
              Get Started as a Patient
            </CustomButton>
          </CustomCard>
        </div>
      </div>
    </div>
  );
}