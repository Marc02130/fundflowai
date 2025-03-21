/**
 * Optional Sections Selection Step
 * 
 * Third step in the grant application wizard that handles:
 * - Optional section selection for an organization's grant sections
 * - Section ordering
 * - Section dependencies
 * - Auto-saving of selections
 * 
 * Features:
 * - Real-time updates
 * - Section descriptions
 * - Validation of selections
 */

import { useState, useEffect, useRef } from 'react';
import { supabase } from '~/lib/supabase';

/**
 * Section data structure from database
 */
interface Section {
  id: string;
  name: string;
  description: string | null;
  flow_order?: number;
}

/**
 * Component props including callbacks and initial state
 */
interface OptionalSectionsStepProps {
  onNext: (data: { selectedSections: string[] }) => void;
  onSave: (data: { selectedSections?: string[] }) => void;
  initialData?: {
    selectedSections?: string[];
    opportunityId?: string;
    organizationId?: string;
  };
}

export default function OptionalSectionsStep({ onNext, onSave, initialData }: OptionalSectionsStepProps) {
  const organizationId = initialData?.organizationId;
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>(initialData?.selectedSections || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const previousSelectionsRef = useRef<string[]>(initialData?.selectedSections || []);
  const isInitialRenderRef = useRef(true);

  // Fetch optional sections for the organization
  useEffect(() => {
    async function fetchSections() {
      if (!organizationId) {
        setError('No organization selected');
        setLoading(false);
        return;
      }

      try {
        // Get the sections for this organization
        const { data, error } = await supabase
          .from('grant_sections')
          .select(`
            id,
            name,
            description,
            flow_order
          `)
          .eq('optional', true)
          .eq('organization_id', organizationId)
          .order('flow_order');

        if (error) throw error;
        setSections(data || []);
      } catch (err) {
        setError('Failed to load optional sections');
        console.error('Error fetching sections:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSections();
  }, [organizationId]);

  const handleNext = () => {
    return new Promise<{ selectedSections: string[] }>((resolve) => {
      console.log('OptionalSectionsStep - handleNext - selectedSections:', selectedSections);
      onNext({ selectedSections });
      resolve({ selectedSections });
    });
  };

  const toggleSection = (sectionId: string) => {
    console.log('OptionalSectionsStep - toggleSection - before:', { sectionId, currentSelected: selectedSections });
    
    // First update local state without calling onSave
    const newSelections = selectedSections.includes(sectionId)
      ? selectedSections.filter(id => id !== sectionId)
      : [...selectedSections, sectionId];
    
    console.log('OptionalSectionsStep - toggleSection - after:', newSelections);
    
    // Update state first
    setSelectedSections(newSelections);
    
    // Then schedule onSave to run after the render cycle completes using setTimeout
    setTimeout(() => {
      onSave({ selectedSections: newSelections });
    }, 0);
  };

  // Expose state values for the parent component
  (window as any).currentStepState = {
    handleNext: () => {
      return handleNext();
    }
  };

  if (error) {
    return (
      <div className="text-red-600 p-4 rounded-md bg-red-50">
        {error}
        <button 
          onClick={() => window.location.reload()} 
          className="ml-4 text-sm underline hover:text-red-800"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center text-gray-500 py-8">
        Loading optional sections...
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No optional sections available for this organization.
        <div className="mt-6">
          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow overflow-hidden rounded-md">
        <ul className="divide-y divide-gray-200">
          {sections.map((section) => (
            <li key={section.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id={section.id}
                      type="checkbox"
                      checked={selectedSections.includes(section.id)}
                      onChange={() => toggleSection(section.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3">
                    <label htmlFor={section.id} className="text-sm font-medium text-gray-900">
                      {section.name}
                    </label>
                    {section.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {section.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 