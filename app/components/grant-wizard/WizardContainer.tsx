/**
 * Grant Application Wizard Container
 * 
 * Core wizard component that manages the multi-step grant application process.
 * Handles state persistence, step navigation, and data collection across steps.
 */

import { useState, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import React from 'react';
import { supabase } from '../../lib/supabase';

/**
 * Defines the structure of each wizard step
 */
interface WizardStep {
  title: string;
  component: ReactNode;
}

/**
 * Props for the wizard container
 */
interface WizardContainerProps {
  steps: WizardStep[];
  onComplete: (data: any) => Promise<string>; // Returns application ID
}

// Local storage key for persisting wizard state
export const WIZARD_STATE_KEY = 'grant_wizard_state';

/**
 * Main wizard container component
 * Manages:
 * - Step navigation and state
 * - Form data persistence
 * - Step validation
 * - Progress tracking
 */
export default function WizardContainer({ steps, onComplete }: WizardContainerProps) {
  // Initialize state from localStorage if it exists
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem(WIZARD_STATE_KEY);
    if (saved) {
      const { step } = JSON.parse(saved);
      return step || 0;
    }
    return 0;
  });

  const [formData, setFormData] = useState<any>(() => {
    const saved = localStorage.getItem(WIZARD_STATE_KEY);
    if (saved) {
      const { data } = JSON.parse(saved);
      return data || {};
    }
    return {};
  });

  /**
   * Persists wizard state to localStorage whenever
   * current step or form data changes
   */
  useEffect(() => {
    localStorage.setItem(WIZARD_STATE_KEY, JSON.stringify({
      step: currentStep,
      data: formData
    }));
  }, [currentStep, formData]);

  // Memoized current step component
  const currentComponent = useMemo(() => steps[currentStep].component, [steps, currentStep]);

  /**
   * Handles navigation to previous step
   * Only enabled when not on first step
   */
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * Saves form data without navigation
   * Used for auto-saving and partial updates
   */
  const saveFormData = (stepData: any) => {
    const newFormData = { ...formData, ...stepData };
    setFormData(newFormData);
  };

  /**
   * Handles navigation to next step
   * Validates current step before proceeding
   * Completes wizard on final step
   */
  const handleNext = async () => {
    console.log('Next button clicked');
    const stepState = (window as any).currentStepState;
    if (stepState?.handleNext) {
      console.log('Calling stepState.handleNext');
      try {
        const stepData = await stepState.handleNext();
        if (currentStep === steps.length - 1) {
          console.log('Completing wizard');
          const finalData = { ...formData, ...stepData };
          await handleComplete(finalData);
        } else {
          console.log('Moving to next step');
          setCurrentStep(currentStep + 1);
        }
      } catch (error) {
        console.error('Error in handleNext:', error);
      }
    }
  };

  /**
   * Handles wizard completion
   * Calls onComplete callback with final data
   * Cleans up wizard state on success
   */
  const handleComplete = async (finalData: any) => {
    try {
      // First call the onComplete callback provided by parent component
      // This should create the grant application and return the new ID
      const newApplicationId = await onComplete(finalData);
      
      // Now create the specialized assistants for this grant application
      console.log('Creating specialized assistants for grant application:', newApplicationId);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.error('No active session found');
          return;
        }
        
        // Validate required fields
        if (!newApplicationId) {
          console.error('Missing grant_application_id - cannot create assistants');
          return;
        }
        
        if (!finalData.grant_type_id) {
          console.error('Missing grant_type_id - cannot create assistants');
          return;
        }
        
        // Log the data being sent
        const requestData = {
          grant_application_id: newApplicationId,
          grant_type_id: finalData.grant_type_id,
          description: finalData.description || ''
        };
        
        console.log('Sending assistant creation request with data:', requestData);
        
        // Call the create-grant-assistant edge function with the new ID
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-grant-assistant`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to create assistants:', errorData);
          // Continue execution despite assistant creation failure
        } else {
          const result = await response.json();
          console.log('Assistants created successfully:', result);
          // Log each assistant ID for verification
          console.log(`Research Assistant ID: ${result.research_assistant_id}`);
          console.log(`Writing Assistant ID: ${result.writing_assistant_id}`);
          console.log(`Review Assistant ID: ${result.review_assistant_id}`);
          console.log(`Shared Thread ID: ${result.openai_thread_id}`);
          console.log(`Shared Vector Store ID: ${result.vector_store_id}`);
        }
      } catch (assistantError) {
        console.error('Error creating assistants:', assistantError);
        // Continue execution despite assistant creation failure
      }
      
      // Clean up wizard state regardless of assistant creation success
      localStorage.removeItem(WIZARD_STATE_KEY);
    } catch (error) {
      console.error('Error completing wizard:', error);
      throw error;
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
                onClick={handleNext}
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
              } catch (error) {
                console.error('Error in step transition:', error);
              }
            },
            onSave: saveFormData,
            initialData: formData
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