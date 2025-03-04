import { useState } from 'react';
import type { ReactNode } from 'react';
import React from 'react';

interface WizardStep {
  title: string;
  component: ReactNode;
}

interface WizardContainerProps {
  steps: WizardStep[];
  onComplete: (data: any) => void;
}

export default function WizardContainer({ steps, onComplete }: WizardContainerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});

  const currentComponent = steps[currentStep].component;

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="p-6">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 
                ${index <= currentStep ? 'border-indigo-600 text-indigo-600' : 'border-gray-300 text-gray-300'}`}>
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className={`h-1 w-12 mx-2 ${index < currentStep ? 'bg-indigo-600' : 'bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 max-w-2xl mx-auto">
          <span className={`text-sm ${currentStep === 0 ? 'text-indigo-600' : 'text-gray-400'}`}>
            {steps[0].title}
          </span>
          <span className={`text-sm ${currentStep === 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
            {steps[1].title}
          </span>
          <span className={`text-sm ${currentStep === 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
            {steps[2].title}
          </span>
        </div>
        <div className="flex justify-between mt-4 max-w-2xl mx-auto">
          <div>
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50"
              >
                Back
              </button>
            )}
          </div>
          <div>
            {currentComponent && (
              <button
                onClick={() => {
                  console.log('Next button clicked');
                  const stepState = (window as any).currentStepState;
                  if (stepState?.handleNext) {
                    console.log('Calling stepState.handleNext');
                    stepState.handleNext();
                  }
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Current step */}
      <div className="mt-6 bg-white rounded-lg shadow-sm p-6 w-4/5 mx-auto">
        {currentComponent ? (
          React.cloneElement(currentComponent as any, {
            onNext: async (stepData: any) => {
              console.log('WizardContainer onNext called with data:', stepData);
              try {
                const newFormData = { ...formData, ...stepData };
                setFormData(newFormData);
                
                // If the current component has an onNext prop, call it and wait for it
                if ((currentComponent as any).props.onNext) {
                  console.log('Calling component onNext prop');
                  await (currentComponent as any).props.onNext(stepData);
                }
                
                if (currentStep === steps.length - 1) {
                  console.log('Completing wizard');
                  await onComplete(newFormData);
                } else {
                  console.log('Moving to next step');
                  setCurrentStep(currentStep + 1);
                }
              } catch (error) {
                console.error('Error in step transition:', error);
              }
            }
          })
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Please complete the previous step first.</p>
          </div>
        )}
      </div>
    </div>
  );
} 