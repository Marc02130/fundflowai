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
  onNext: (data: { 
    organizationId: string;
    opportunityId: string;
    searchTerm: string;
  }) => void;
  initialData?: {
    organizationId?: string;
    opportunityId?: string;
    searchTerm?: string;
  };
}

export default function OrganizationOpportunityStep({ onNext, initialData }: OrganizationOpportunityStepProps) {
  console.log('OrganizationOpportunityStep render');

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [opportunities, setOpportunities] = useState<GrantOpportunity[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<string>(initialData?.organizationId || '');
  const [selectedOpportunity, setSelectedOpportunity] = useState<string>(initialData?.opportunityId || '');
  const [searchTerm, setSearchTerm] = useState(initialData?.searchTerm || '');
  const [loading, setLoading] = useState(true);
  const [loadingOpportunities, setLoadingOpportunities] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Expose state values for the parent component
  (window as any).currentStepState = {
    selectedOrganization,
    selectedOpportunity,
    handleNext: () => {
      if (selectedOrganization && selectedOpportunity) {
        onNext({
          organizationId: selectedOrganization,
          opportunityId: selectedOpportunity,
          searchTerm: searchTerm
        });
      }
    }
  };

  // Fetch organizations on component mount
  useEffect(() => {
    let isMounted = true;

    async function fetchOrganizations() {
      try {
        console.log('Fetching organizations');
        const { data, error } = await supabase
          .from('organizations')
          .select('id, name')
          .eq('grant_funder', true)
          .order('name');

        if (error) throw error;
        if (isMounted) {
          console.log('Fetched organizations:', data);
          setOrganizations(data || []);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load organizations');
          console.error('Error fetching organizations:', err);
          setLoading(false);
        }
      }
    }

    fetchOrganizations();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch opportunities when organization changes or on initial load with initialData
  useEffect(() => {
    let isMounted = true;

    async function fetchOpportunities() {
      if (!selectedOrganization) return;

      setLoadingOpportunities(true);
      try {
        console.log('Fetching opportunities for organization:', selectedOrganization);
        const { data, error } = await supabase
          .from('grant_opportunities')
          .select(`
            id,
            title,
            announcement_number,
            expiration_date,
            grants!inner (
              organization_id
            )
          `)
          .eq('grants.organization_id', selectedOrganization)
          .gte('expiration_date', new Date().toISOString())
          .order('title');

        if (error) throw error;
        if (isMounted) {
          console.log('Fetched opportunities:', data);
          setOpportunities(data || []);
          setLoadingOpportunities(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching opportunities:', err);
          setError('Failed to load opportunities');
          setLoadingOpportunities(false);
        }
      }
    }

    fetchOpportunities();

    return () => {
      isMounted = false;
    };
  }, [selectedOrganization]);

  // Filter opportunities based on search term
  const filteredOpportunities = opportunities.filter(opp => {
    if (searchTerm.length < 3) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      opp.title.toLowerCase().includes(searchLower) ||
      opp.announcement_number.toLowerCase().includes(searchLower)
    );
  });

  const handleOrganizationChange = (orgId: string) => {
    setSelectedOrganization(orgId);
    setSelectedOpportunity('');
    setSearchTerm('');
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
        Loading organizations...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Organization Selection */}
      <div>
        <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
          Funding Organization
        </label>
        <select
          id="organization"
          value={selectedOrganization}
          onChange={(e) => handleOrganizationChange(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="">Select an organization</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>

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
            {loadingOpportunities ? (
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
                {filteredOpportunities.map((opp) => (
                  <li key={opp.id}>
                    <label className="block hover:bg-gray-50 cursor-pointer">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="opportunity"
                            value={opp.id}
                            checked={selectedOpportunity === opp.id}
                            onChange={() => setSelectedOpportunity(opp.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{opp.title}</p>
                            <p className="text-sm text-gray-500">
                              Announcement: {opp.announcement_number}
                            </p>
                            <p className="text-sm text-gray-500">
                              Expires: {new Date(opp.expiration_date).toLocaleDateString()}
                            </p>
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