import { useState, useEffect } from 'react';
import { supabase } from '~/lib/supabase';

interface GrantType {
  id: string;
  name: string;
  description: string;
}

interface GrantTypeBasicInfoStepProps {
  organizationId: string;
  onNext: (data: {
    title: string;
    description: string;
    grantTypeId: string;
    resubmission: boolean;
  }) => void;
}

export default function GrantTypeBasicInfoStep({ organizationId, onNext }: GrantTypeBasicInfoStepProps) {
  console.log('GrantTypeBasicInfoStep render with organizationId:', organizationId);

  const [grantTypes, setGrantTypes] = useState<GrantType[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [resubmission, setResubmission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch grant types for the selected organization
  useEffect(() => {
    console.log('GrantTypeBasicInfoStep useEffect running with organizationId:', organizationId);
    
    async function fetchGrantTypes() {
      if (!organizationId) {
        console.log('No organizationId provided, skipping fetch');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching grant types for organization:', organizationId);
        const { data, error } = await supabase
          .from('grant_type')
          .select('id, name, description')
          .eq('organization_id', organizationId)
          .eq('active', true)
          .order('name');

        if (error) throw error;
        console.log('Fetched grant types:', data);
        setGrantTypes(data || []);
      } catch (err) {
        console.error('Error fetching grant types:', err);
        setError('Failed to load grant types');
      } finally {
        setLoading(false);
      }
    }

    fetchGrantTypes();
  }, [organizationId]);

  const handleNext = () => {
    if (title && description && selectedType) {
      console.log('GrantTypeBasicInfoStep handleNext called with:', {
        title,
        description,
        grantTypeId: selectedType,
        resubmission,
      });
      onNext({
        title,
        description,
        grantTypeId: selectedType,
        resubmission,
      });
    }
  };

  const isValid = title.trim() && description.trim() && selectedType;

  // Expose state values for the parent component
  (window as any).currentStepState = {
    handleNext: () => {
      console.log('currentStepState.handleNext called');
      if (isValid) {
        console.log('Form is valid, calling handleNext');
        handleNext();
      }
    }
  };

  if (!organizationId) {
    console.log('GrantTypeBasicInfoStep rendering "select organization" message');
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Please select an organization and opportunity first.</p>
      </div>
    );
  }

  if (error) {
    console.log('GrantTypeBasicInfoStep rendering error state:', error);
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
    console.log('GrantTypeBasicInfoStep rendering loading state');
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading grant types...</p>
      </div>
    );
  }

  console.log('GrantTypeBasicInfoStep rendering form with grant types:', grantTypes);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Grant Type Selection */}
      <div>
        <label htmlFor="grantType" className="block text-sm font-medium text-gray-700">
          Grant Type
        </label>
        <select
          id="grantType"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          required
        >
          <option value="">Select a grant type</option>
          {grantTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
        {selectedType && (
          <p className="mt-2 text-sm text-gray-500">
            {grantTypes.find(t => t.id === selectedType)?.description}
          </p>
        )}
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Application Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
        <p className="mt-2 text-sm text-gray-500">
          This title will be displayed in your unsubmitted applications list
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>

      {/* Resubmission Checkbox */}
      <div className="flex items-center">
        <input
          id="resubmission"
          type="checkbox"
          checked={resubmission}
          onChange={(e) => setResubmission(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="resubmission" className="ml-2 block text-sm text-gray-900">
          This is a resubmission
        </label>
      </div>
    </div>
  );
} 