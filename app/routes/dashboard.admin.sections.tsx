/**
 * Admin Grant Sections Route
 * 
 * Allows administrators to manage grant sections by organization.
 * This is the first admin functionality implemented.
 * 
 * Features:
 * - Organization selection
 * - Display of grant sections by organization
 * - Editing of section details
 * 
 * @route /dashboard/admin/sections
 */

import { useState, useEffect } from 'react';
import { useAuth } from '~/context/AuthContext';
import { supabase } from '~/lib/supabase';
import type { Route } from '~/+types/auth';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Admin - Edit Grant Sections - Fund Flow AI" },
    { name: "description", content: "Manage grant sections for organizations" },
  ];
}

// Interfaces for type safety
interface Organization {
  id: string;
  name: string;
}

interface GrantSection {
  id: string;
  name: string;
  description: string | null;
  output_type: string;
  flow_order: number | null;
  optional: boolean;
  instructions: string | null;
  ai_generator_prompt: string | null;
  ai_visualizations_prompt: string | null;
}

export default function AdminSections() {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [sections, setSections] = useState<GrantSection[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<GrantSection | null>(null);
  const [formData, setFormData] = useState<Partial<GrantSection>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch organizations on component mount
  useEffect(() => {
    let isMounted = true;

    async function fetchOrganizations() {
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('id, name')
          .eq('grant_funder', true)
          .order('name');

        if (error) throw error;
        if (isMounted) {
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

  // Fetch grant sections when organization changes
  useEffect(() => {
    let isMounted = true;

    async function fetchSections() {
      if (!selectedOrganization) {
        setSections([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('grant_sections')
          .select(`
            id,
            name,
            description,
            output_type,
            flow_order,
            optional,
            instructions,
            ai_generator_prompt,
            ai_visualizations_prompt
          `)
          .eq('organization_id', selectedOrganization)
          .order('flow_order', { ascending: true, nullsFirst: false });

        if (error) throw error;
        if (isMounted) {
          setSections(data || []);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load grant sections');
          console.error('Error fetching grant sections:', err);
          setLoading(false);
        }
      }
    }

    fetchSections();

    return () => {
      isMounted = false;
    };
  }, [selectedOrganization]);

  // Handle organization selection change
  const handleOrganizationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOrganization(e.target.value);
    setSelectedSection(null);
    setIsEditing(false);
    setFormData({});
    setError(null);
    setSuccessMessage(null);
  };

  // Handle section selection
  const handleSectionSelect = (section: GrantSection) => {
    setSelectedSection(section);
    setFormData(section);
    setIsEditing(true);
    setError(null);
    setSuccessMessage(null);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox/boolean fields
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSection) return;
    
    setSavingSection(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Update the section in the database
      const { error } = await supabase
        .from('grant_sections')
        .update({
          name: formData.name,
          description: formData.description,
          output_type: formData.output_type,
          flow_order: formData.flow_order,
          optional: formData.optional,
          instructions: formData.instructions,
          ai_generator_prompt: formData.ai_generator_prompt,
          ai_visualizations_prompt: formData.ai_visualizations_prompt,
          updated_at: new Date()
        })
        .eq('id', selectedSection.id);

      if (error) throw error;

      // Update sections list with the edited section
      setSections(sections.map(s => 
        s.id === selectedSection.id ? { ...s, ...formData as GrantSection } : s
      ));

      setSuccessMessage('Section updated successfully');
    } catch (err) {
      setError('Failed to update section');
      console.error('Error updating section:', err);
    } finally {
      setSavingSection(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    setSelectedSection(null);
    setFormData({});
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div className="bg-white rounded-lg shadow p-6">
        {/* Organization selector */}
        <div className="mb-6">
          <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
            Select Organization
          </label>
          <select
            id="organization"
            value={selectedOrganization}
            onChange={handleOrganizationChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-2 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">Select an organization</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
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

        {!selectedOrganization && !loading && (
          <div className="text-center py-8 text-gray-500">
            Please select an organization to manage grant sections.
          </div>
        )}

        {selectedOrganization && !loading && (
          <div className="mt-4 flex flex-col lg:flex-row gap-8">
            {/* Sections list */}
            <div className="lg:w-1/3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Grant Sections</h3>
              {sections.length === 0 ? (
                <div className="text-gray-500">No sections found for this organization.</div>
              ) : (
                <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md overflow-hidden">
                  {sections.map((section) => (
                    <li 
                      key={section.id}
                      className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${selectedSection?.id === section.id ? 'bg-blue-50' : ''}`}
                      onClick={() => handleSectionSelect(section)}
                    >
                      <div className="font-medium text-gray-800">{section.name}</div>
                      <div className="text-sm text-gray-500 truncate">{section.description || 'No description'}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Edit form */}
            {isEditing && selectedSection && (
              <div className="lg:w-2/3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Section</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Section Name *
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="output_type" className="block text-sm font-medium text-gray-700">
                        Output Type *
                      </label>
                      <select
                        id="output_type"
                        name="output_type"
                        value={formData.output_type || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-2 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        required
                      >
                        <option value="">Select output type</option>
                        <option value="text">Text</option>
                        <option value="pdf">PDF</option>
                        <option value="docx">DOCX</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="flow_order" className="block text-sm font-medium text-gray-700">
                        Display Order
                      </label>
                      <input
                        type="number"
                        id="flow_order"
                        name="flow_order"
                        value={formData.flow_order || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="optional"
                      name="optional"
                      checked={formData.optional || false}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="optional" className="ml-2 block text-sm text-gray-700">
                      Optional section (not required)
                    </label>
                  </div>

                  <div>
                    <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">
                      Instructions for Grant Writer
                    </label>
                    <textarea
                      id="instructions"
                      name="instructions"
                      value={formData.instructions || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="ai_generator_prompt" className="block text-sm font-medium text-gray-700">
                      AI Generator Prompt
                    </label>
                    <textarea
                      id="ai_generator_prompt"
                      name="ai_generator_prompt"
                      value={formData.ai_generator_prompt || ''}
                      onChange={handleInputChange}
                      rows={5}
                      className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="ai_visualizations_prompt" className="block text-sm font-medium text-gray-700">
                      AI Visualizations Prompt
                    </label>
                    <textarea
                      id="ai_visualizations_prompt"
                      name="ai_visualizations_prompt"
                      value={formData.ai_visualizations_prompt || ''}
                      onChange={handleInputChange}
                      rows={5}
                      className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
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
                      disabled={savingSection}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {savingSection ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {!isEditing && selectedOrganization && (
              <div className="lg:w-2/3 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p>Select a section from the list to edit its details.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 