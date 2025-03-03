import { useState, useEffect } from 'react';
import { supabase } from '~/lib/supabase';

interface Section {
  id: string;
  name: string;
  description: string | null;
}

interface OptionalSectionsStepProps {
  grantId: string;
  onNext: (data: { selectedSections: string[] }) => void;
}

export default function OptionalSectionsStep({ grantId, onNext }: OptionalSectionsStepProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch optional sections for the grant
  useEffect(() => {
    async function fetchSections() {
      try {
        const { data, error } = await supabase
          .from('grant_sections')
          .select('id, name, description')
          .eq('grant_id', grantId)
          .eq('optional', true)
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
  }, [grantId]);

  const handleNext = () => {
    onNext({ selectedSections });
  };

  const toggleSection = (sectionId: string) => {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
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
        No optional sections available for this grant.
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