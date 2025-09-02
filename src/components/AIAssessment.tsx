import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatBubble } from './foundation/ChatBubble';
import { CustomButton } from './foundation/Button';
import { CustomInput } from './foundation/Input';

export default function AIAssessment() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<Array<{ type: 'system' | 'patient'; content: string }>>([]);
  const [inputValue, setInputValue] = useState('');
  const [responses, setResponses] = useState<{ [key: string]: string }>({});

  const steps = [
    'greeting',
    'feeling-check',
    'sleep-patterns',
    'anxiety-levels',
    'mood-changes',
    'summary'
  ];

  const stepContent = {
    greeting: {
      system: "Hello! I'm here to help you understand your current mental health. This free assessment takes about 5 minutes and can provide insights before connecting with a provider. Shall we begin?",
      placeholder: "Type 'yes' to start"
    },
    'feeling-check': {
      system: "Over the past two weeks, how would you describe your overall mood? Have you been feeling down, hopeless, or having little interest in activities you usually enjoy?",
      placeholder: "Describe how you've been feeling..."
    },
    'sleep-patterns': {
      system: "How has your sleep been recently? Are you having trouble falling asleep, staying asleep, or sleeping too much?",
      placeholder: "Tell me about your sleep..."
    },
    'anxiety-levels': {
      system: "Have you been experiencing feelings of nervousness, anxiety, or worry? How often would you say these feelings occur?",
      placeholder: "Describe your anxiety levels..."
    },
    'mood-changes': {
      system: "Have you noticed any significant changes in your appetite, energy levels, or ability to concentrate?",
      placeholder: "Share any changes you've noticed..."
    },
    summary: {
      system: "Thank you for completing this assessment. Based on your responses, it sounds like you might benefit from speaking with a mental health professional. Would you like to connect with a licensed provider through PsychiatryNow?",
      placeholder: "Click below to continue"
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessages = [...messages];
    newMessages.push({ type: 'patient', content: inputValue });

    const newResponses = { ...responses };
    newResponses[steps[currentStep]] = inputValue;
    setResponses(newResponses);

    setMessages(newMessages);
    setInputValue('');

    setTimeout(() => {
      if (currentStep < steps.length - 1) {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        const nextContent = stepContent[steps[nextStep] as keyof typeof stepContent];
        setMessages(prev => [...prev, { type: 'system', content: nextContent.system }]);
      }
    }, 1000);
  };

  // Initialize first message
  useState(() => {
    const firstContent = stepContent[steps[0] as keyof typeof stepContent];
    setMessages([{ type: 'system', content: firstContent.system }]);
  });

  const currentContent = stepContent[steps[currentStep] as keyof typeof stepContent];

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-gray-600">
            ←
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-medium text-gray-900">AI Self-Assessment</h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-sm text-gray-600">Free Mental Health Check</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white px-4 py-2 border-b border-gray-100">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{currentStep + 1} of {steps.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 pb-24 space-y-4">
        {messages.map((message, index) => (
          <ChatBubble key={index} type={message.type}>
            <div className="whitespace-pre-line">{message.content}</div>
          </ChatBubble>
        ))}
      </div>

      {/* Input Composer */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 p-4">
        {steps[currentStep] === 'summary' ? (
          <div className="space-y-3">
            <CustomButton 
              variant="primary" 
              onClick={() => navigate('/patient-intake')}
              className="w-full"
            >
              Connect with a Provider
            </CustomButton>
            <CustomButton 
              variant="secondary" 
              onClick={() => navigate('/')}
              className="w-full"
            >
              Return to Home
            </CustomButton>
          </div>
        ) : (
          <div className="flex gap-2">
            <CustomInput
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={currentContent.placeholder}
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <CustomButton variant="primary" onClick={handleSendMessage}>
              Send
            </CustomButton>
          </div>
        )}
      </div>
    </div>
  );
}