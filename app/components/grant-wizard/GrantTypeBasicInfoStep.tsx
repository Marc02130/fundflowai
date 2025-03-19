/**
 * Grant Type and Basic Information Step
 * 
 * First step in the grant application wizard that collects:
 * - Grant type selection
 * - Application title and description
 * - Amount requested
 * - Resubmission status
 * 
 * Features:
 * - Real-time validation
 * - Auto-saving
 * - Organization-specific grant types
 */

import { useState, useEffect } from 'react';
import { supabase } from '~/lib/supabase';

/**
 * Grant type definition from database
 */
interface GrantType {
  id: string;
  name: string;
  description: string;
}

/**
 * Component props including callbacks and initial state
 */
interface GrantTypeBasicInfoStepProps {
  onNext: (data: {
    title: string;
    description: string;
    grantTypeId: string;
    resubmission: boolean;
    amount_requested?: number;
  }) => void;
  onSave: (data: {
    title: string;
    description: string;
    grantTypeId: string;
    resubmission: boolean;
    amount_requested?: number;
  }) => void;
  initialData?: {
    title?: string;
    description?: string;
    grantTypeId?: string;
    resubmission?: boolean;
    amount_requested?: number;
    organizationId?: string;
  };
}

export default function GrantTypeBasicInfoStep({ 
  onNext, 
  onSave,
  initialData 
}: GrantTypeBasicInfoStepProps) {
  const organizationId = initialData?.organizationId;
  console.log('GrantTypeBasicInfoStep render with organizationId:', organizationId);
  console.log('Initial data:', initialData);

  const [grantTypes, setGrantTypes] = useState<GrantType[]>([]);
  const [selectedType, setSelectedType] = useState(initialData?.grantTypeId || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [resubmission, setResubmission] = useState(initialData?.resubmission || false);
  const [amountRequested, setAmountRequested] = useState(initialData?.amount_requested || 0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update state when initialData changes
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setSelectedType(initialData.grantTypeId || '');
      setResubmission(initialData.resubmission || false);
      setAmountRequested(initialData.amount_requested || 0);
    }
  }, [initialData]);

  // Fetch grant types for the selected organization
  useEffect(() => {
    let isMounted = true;
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
        if (isMounted) {
          console.log('Fetched grant types:', data);
          setGrantTypes(data || []);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching grant types:', err);
          setError('Failed to load grant types');
          setLoading(false);
        }
      }
    }

    fetchGrantTypes();

    return () => {
      isMounted = false;
    };
  }, [organizationId]);

  // Save current form state
  const saveFormState = (updates: Partial<{
    title: string;
    description: string;
    grantTypeId: string;
    resubmission: boolean;
    amount_requested: number;
  }>) => {
    const currentState = {
      title,
      description,
      grantTypeId: selectedType,
      resubmission,
      amount_requested: amountRequested
    };
    const newState = { ...currentState, ...updates };
    onSave(newState);
  };

  // Handle next button click
  const handleNext = () => {
    if (title && description && selectedType) {
      console.log('GrantTypeBasicInfoStep handleNext called with:', {
        title,
        description,
        grantTypeId: selectedType,
        resubmission,
        amount_requested: amountRequested,
      });
      onNext({
        title,
        description,
        grantTypeId: selectedType,
        resubmission,
        amount_requested: amountRequested,
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
          onChange={(e) => {
            setSelectedType(e.target.value);
            saveFormState({ grantTypeId: e.target.value });
          }}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-2 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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

      {/* Amount Requested */}
      <div>
        <label htmlFor="amount_requested" className="block text-sm font-medium text-gray-700">
          Amount Requested
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            name="amount_requested"
            id="amount_requested"
            value={amountRequested || ''}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              setAmountRequested(value);
              saveFormState({ amount_requested: value });
            }}
            className="mt-1 block w-full pl-7 pr-12 border-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="0.00"
            step="0.01"
            min="0"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">USD</span>
          </div>
        </div>
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
          onChange={(e) => {
            setTitle(e.target.value);
            saveFormState({ title: e.target.value });
          }}
          className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>

      {/* Description */}
      <div>
        <p className="text-sm pb-2 text-gray-900">To facilitate the generation of a high-quality first draft of your application, please provide a detailed description. First, this description, along with any grant writer attachments, will be used to generate in-depth research. Then, this in-depth research, combined with the original description and attachments, will be used to create the first draft of the application. Therefore, provide sufficient detail in your description and attachments.</p>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            saveFormState({ description: e.target.value });
          }}
          rows={6}
          className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>

      {/* Resubmission Checkbox */}
      <div className="flex items-center">
        <input
          id="resubmission"
          type="checkbox"
          checked={resubmission}
          onChange={(e) => {
            setResubmission(e.target.checked);
            saveFormState({ resubmission: e.target.checked });
          }}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="resubmission" className="ml-2 block text-sm text-gray-900">
          This is a resubmission
        </label>
      </div>
    </div>
  );
} 