import { useState, useEffect } from 'react';
import { supabase } from '~/lib/supabase';

interface Organization {
  id: string;
  name: string;
}

interface GrantOpportunity {
  id: string;
  title: string;
  announcement_number: string;
  expiration_date: string;
}

interface OrganizationOpportunityStepProps {
  onNext: (data: { organizationId: string, opportunityId: string }) => void;
}

export default function OrganizationOpportunityStep({ onNext }: OrganizationOpportunityStepProps) {
  console.log('OrganizationOpportunityStep render');

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [opportunities, setOpportunities] = useState<GrantOpportunity[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<string>('');
  const [selectedOpportunity, setSelectedOpportunity] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Expose state values for the parent component
  (window as any).currentStepState = {
    selectedOrganization,
    selectedOpportunity,
    handleNext: () => {
      if (selectedOrganization && selectedOpportunity) {
        onNext({
          organizationId: selectedOrganization,
          opportunityId: selectedOpportunity
        });
      }
    }
  };

  // Fetch organizations on component mount
  useEffect(() => {
    async function fetchOrganizations() {
      try {
        console.log('Fetching organizations');
        const { data, error } = await supabase
          .from('organizations')
          .select('id, name')
          .eq('grant_funder', true)
          .order('name');

        if (error) throw error;
        console.log('Fetched organizations:', data);
        setOrganizations(data || []);
      } catch (err) {
        setError('Failed to load organizations');
        console.error('Error fetching organizations:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrganizations();
  }, []);

  // Fetch opportunities when organization is selected and search term is >= 3 characters
  useEffect(() => {
    async function fetchOpportunities() {
      if (!selectedOrganization || searchTerm.length < 3) {
        setOpportunities([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        console.log('Fetching opportunities for organization:', selectedOrganization);
        const { data, error } = await supabase
          .from('grant_opportunities')
          .select(`
            id,
            title,
            announcement_number,
            expiration_date,
            grant_id,
            grants!inner (
              organization_id
            )
          `)
          .eq('grants.organization_id', selectedOrganization)
          .gte('expiration_date', new Date().toISOString())
          .or(`title.ilike.%${searchTerm}%,announcement_number.ilike.%${searchTerm}%`)
          .order('expiration_date');

        if (error) throw error;
        console.log('Fetched opportunities:', data);
        setOpportunities(data || []);
      } catch (err) {
        setError('Failed to load opportunities');
        console.error('Error fetching opportunities:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchOpportunities();
  }, [selectedOrganization, searchTerm]);

  // Remove the separate filter since we're now filtering in the query
  const filteredOpportunities = opportunities;

  const handleNext = () => {
    console.log('OrganizationOpportunityStep handleNext called');
    console.log('Selected organization:', selectedOrganization);
    console.log('Selected opportunity:', selectedOpportunity);

    if (selectedOrganization && selectedOpportunity) {
      const data = {
        organizationId: selectedOrganization,
        opportunityId: selectedOpportunity
      };
      console.log('Calling onNext with data:', data);
      onNext(data);
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

  return (
    <div className="space-y-6">
      {/* Organization Selection */}
      <div>
        <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
          Funding Organization
        </label>
        <select
          id="organization"
          value={selectedOrganization}
          onChange={(e) => {
            console.log('Organization selected:', e.target.value);
            setSelectedOrganization(e.target.value);
            setSelectedOpportunity('');
            setSearchTerm('');
          }}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          required
        >
          <option value="">Select an organization</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>

      {/* Opportunity Search and Selection */}
      {selectedOrganization && (
        <div className="space-y-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Search Opportunities
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter at least 3 characters to search"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {searchTerm.length > 0 && searchTerm.length < 3 && (
              <p className="mt-1 text-sm text-gray-500">
                Please enter at least 3 characters to search
              </p>
            )}
          </div>

          <div className="bg-white shadow overflow-hidden rounded-md">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading opportunities...</div>
            ) : searchTerm.length < 3 ? (
              <div className="p-4 text-center text-gray-500">
                Enter at least 3 characters to search for opportunities
              </div>
            ) : filteredOpportunities.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No matching opportunities found
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {opportunities.map((opp) => (
                  <li key={opp.id}>
                    <label className="block hover:bg-gray-50 cursor-pointer">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="opportunity"
                            value={opp.id}
                            checked={selectedOpportunity === opp.id}
                            onChange={(e) => {
                              console.log('Opportunity selected:', e.target.value);
                              setSelectedOpportunity(e.target.value);
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {opp.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {opp.announcement_number} · Expires: {new Date(opp.expiration_date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 