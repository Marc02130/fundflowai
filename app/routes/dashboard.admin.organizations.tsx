/**
 * Admin Organizations Route
 * 
 * Allows administrators to manage organizations.
 * 
 * Features:
 * - List view of all organizations
 * - Adding new organizations
 * - Editing organization details
 * - Marking organizations as grant funders
 * 
 * @route /dashboard/admin/organizations
 */

import { useState, useEffect } from 'react';
import { useAuth } from '~/context/AuthContext';
import { supabase } from '~/lib/supabase';
import type { Route } from '~/+types/auth';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Admin - Edit Organizations - Fund Flow AI" },
    { name: "description", content: "Manage organizations" },
  ];
}

// Interface for organization data
interface Organization {
  id: string;
  name: string;
  description: string | null;
  url: string | null;
  grant_opportunities_url: string | null;
  grant_funder: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function AdminOrganizations() {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [formData, setFormData] = useState<Partial<Organization>>({
    name: '',
    description: '',
    url: '',
    grant_opportunities_url: '',
    grant_funder: false
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showOnlyGrantFunders, setShowOnlyGrantFunders] = useState(false);
  const [savingOrganization, setSavingOrganization] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch organizations on component mount or when filter changes
  useEffect(() => {
    fetchOrganizations();
  }, [showOnlyGrantFunders]);

  // Fetch organizations based on filter settings
  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('organizations')
        .select('*')
        .order('name');
      
      if (showOnlyGrantFunders) {
        query = query.eq('grant_funder', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setOrganizations(data || []);
    } catch (err) {
      setError('Failed to load organizations');
      console.error('Error fetching organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle organization selection for editing
  const handleOrganizationSelect = (organization: Organization) => {
    setSelectedOrganization(organization);
    setFormData({
      name: organization.name,
      description: organization.description || '',
      url: organization.url || '',
      grant_opportunities_url: organization.grant_opportunities_url || '',
      grant_funder: organization.grant_funder || false
    });
    setIsEditing(true);
    setIsCreating(false);
    setError(null);
    setSuccessMessage(null);
  };

  // Handle creating a new organization
  const handleCreateNew = () => {
    setSelectedOrganization(null);
    setFormData({
      name: '',
      description: '',
      url: '',
      grant_opportunities_url: '',
      grant_funder: false
    });
    setIsCreating(true);
    setIsEditing(false);
    setError(null);
    setSuccessMessage(null);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox fields
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle filter change
  const handleFilterChange = () => {
    setShowOnlyGrantFunders(!showOnlyGrantFunders);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      setError('Organization name is required');
      return;
    }
    
    setSavingOrganization(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isCreating) {
        // Create new organization
        const { data, error } = await supabase
          .from('organizations')
          .insert({
            name: formData.name,
            description: formData.description || null,
            url: formData.url || null,
            grant_opportunities_url: formData.grant_opportunities_url || null,
            grant_funder: formData.grant_funder || false
          })
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          setOrganizations([...organizations, data[0]]);
          setSuccessMessage('Organization created successfully');
        }
      } else if (isEditing && selectedOrganization) {
        // Update existing organization
        const { error } = await supabase
          .from('organizations')
          .update({
            name: formData.name,
            description: formData.description || null,
            url: formData.url || null,
            grant_opportunities_url: formData.grant_opportunities_url || null,
            grant_funder: formData.grant_funder || false,
            updated_at: new Date()
          })
          .eq('id', selectedOrganization.id);

        if (error) throw error;

        // Update the organizations list with the edited item
        setOrganizations(organizations.map(org => 
          org.id === selectedOrganization.id ? { 
            ...org, 
            name: formData.name || '',
            description: formData.description || null,
            url: formData.url || null,
            grant_opportunities_url: formData.grant_opportunities_url || null,
            grant_funder: formData.grant_funder || false
          } : org
        ));

        setSuccessMessage('Organization updated successfully');
      }
      
      // Reset form
      handleCancel();
    } catch (err) {
      setError('Failed to save organization');
      console.error('Error saving organization:', err);
    } finally {
      setSavingOrganization(false);
    }
  };

  // Cancel editing or creating
  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    setSelectedOrganization(null);
    setFormData({
      name: '',
      description: '',
      url: '',
      grant_opportunities_url: '',
      grant_funder: false
    });
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div className="bg-white rounded-lg shadow p-6">
        {/* Filter and Create buttons */}
        <div className="flex justify-between mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="grant_funder_filter"
              checked={showOnlyGrantFunders}
              onChange={handleFilterChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="grant_funder_filter" className="ml-2 block text-sm text-gray-700">
              Show only grant funders
            </label>
          </div>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create New Organization
          </button>
        </div>

        {loading && <div className="text-center py-8">Loading...</div>}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        {!loading && (
          <div className="mt-4 flex flex-col lg:flex-row gap-8">
            {/* Organizations list */}
            <div className="lg:w-1/3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Organizations</h3>
              {organizations.length === 0 ? (
                <div className="text-gray-500">No organizations found.</div>
              ) : (
                <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md overflow-hidden">
                  {organizations.map((org) => (
                    <li 
                      key={org.id}
                      className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${selectedOrganization?.id === org.id ? 'bg-blue-50' : ''}`}
                      onClick={() => handleOrganizationSelect(org)}
                    >
                      <div className="font-medium text-gray-800">{org.name}</div>
                      <div className="text-sm text-gray-500 truncate">{org.description || 'No description'}</div>
                      {org.grant_funder && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                          Grant Funder
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Add/Edit form */}
            {(isEditing || isCreating) && (
              <div className="lg:w-2/3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {isCreating ? "Create New Organization" : "Edit Organization"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                      Organization URL
                    </label>
                    <input
                      type="url"
                      id="url"
                      name="url"
                      value={formData.url || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="https://example.org"
                    />
                  </div>

                  <div>
                    <label htmlFor="grant_opportunities_url" className="block text-sm font-medium text-gray-700">
                      Grant Opportunities URL
                    </label>
                    <input
                      type="url"
                      id="grant_opportunities_url"
                      name="grant_opportunities_url"
                      value={formData.grant_opportunities_url || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="https://example.org/grants"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="grant_funder"
                      name="grant_funder"
                      checked={formData.grant_funder || false}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="grant_funder" className="ml-2 block text-sm text-gray-700">
                      This organization funds grants
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingOrganization}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {savingOrganization ? 'Saving...' : (isCreating ? 'Create' : 'Save Changes')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {!isEditing && !isCreating && (
              <div className="lg:w-2/3 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p className="mb-4">Select an organization to edit or create a new one.</p>
                  <button
                    onClick={handleCreateNew}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create New Organization
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 