import { cn } from "../ui/utils";

interface StepperProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export function Stepper({ currentStep, totalSteps, steps }: StepperProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          
          return (
            <div key={index} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                isCompleted ? "bg-green-600 text-white" :
                isActive ? "bg-blue-600 text-white" :
                "bg-gray-200 text-gray-600"
              )}>
                {isCompleted ? '✓' : stepNumber}
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "h-1 w-16 mx-2",
                  stepNumber < currentStep ? "bg-green-600" : "bg-gray-200"
                )} />
              )}
            </div>
          );
        })}
      </div>
      <div className="text-sm text-gray-600 text-center">
        Step {currentStep} of {totalSteps}: {steps[currentStep - 1]}
      </div>
    </div>
  );
}