/**
 * Admin User Profiles Route
 * 
 * Allows administrators to manage user profiles.
 * 
 * Features:
 * - List view of all users
 * - Editing user profile details
 * - Role assignment
 * - Organization affiliation
 * 
 * @route /dashboard/admin/users
 */

import { useState, useEffect } from 'react';
import { useAuth } from '~/context/AuthContext';
import { supabase } from '~/lib/supabase';
import type { Route } from '~/+types/auth';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Admin - Edit User Profiles - Fund Flow AI" },
    { name: "description", content: "Manage user profiles and permissions" },
  ];
}

// Interfaces for type safety
interface Organization {
  id: string;
  name: string;
}

interface UserProfileWithOrg {
  id: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  organization_id?: string;
  role?: string;
  organizations?: {
    id: string;
    name: string;
  };
}

interface UserProfile {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  organization_id?: string;
  organization_name?: string;
  role?: string;
}

export default function AdminUsers() {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch organizations and users on component mount
  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        // Fetch organizations
        const { data: orgsData, error: orgsError } = await supabase
          .from('organizations')
          .select('id, name')
          .order('name');

        if (orgsError) throw orgsError;

        // Fetch user profiles with organization names
        const { data: userData, error: userError } = await supabase
          .from('user_profiles')
          .select(`
            id,
            first_name,
            last_name,
            display_name,
            role,
            organization_id,
            organizations (
              id,
              name
            )
          `)
          .order('first_name');

        if (userError) throw userError;

        // Transform data to include organization name and prepare for email lookup
        const transformedUsers = (userData as any[]).map(profile => ({
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          display_name: profile.display_name,
          role: profile.role,
          organization_id: profile.organization_id,
          organization_name: profile.organizations ? profile.organizations.name : 'None',
          email: '' // Will be populated later
        }));

        if (isMounted) {
          setOrganizations(orgsData || []);
          setUsers(transformedUsers);
          
          // Now fetch emails in a separate pass (this is a demo without proper RLS)
          // In a production app, you would use Supabase auth admin endpoints or server-side code
          transformedUsers.forEach(async (user, index) => {
            try {
              // This is a simplified approach for demo purposes
              // You should use a proper auth system or server function in production
              const response = await fetch(`/api/user-email?id=${user.id}`);
              if (response.ok) {
                const data = await response.json();
                if (data.email && isMounted) {
                  setUsers(prevUsers => {
                    const updatedUsers = [...prevUsers];
                    updatedUsers[index] = { ...updatedUsers[index], email: data.email };
                    return updatedUsers;
                  });
                }
              }
            } catch (err) {
              console.error(`Failed to fetch email for user ${user.id}:`, err);
            }
          });
          
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load data');
          console.error('Error fetching data:', err);
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle user selection
  const handleUserSelect = (userProfile: UserProfile) => {
    setSelectedUser(userProfile);
    setFormData(userProfile);
    setIsEditing(true);
    setError(null);
    setSuccessMessage(null);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;
    
    setSavingUser(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Update the user profile in the database
      const { error } = await supabase
        .from('user_profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          display_name: formData.display_name,
          role: formData.role,
          organization_id: formData.organization_id === '' ? null : formData.organization_id,
          updated_at: new Date()
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      // Get updated organization name if organization changed
      let organizationName = 'None';
      if (formData.organization_id) {
        const org = organizations.find(o => o.id === formData.organization_id);
        if (org) organizationName = org.name;
      }

      // Update users list with the edited user
      setUsers(users.map(u => 
        u.id === selectedUser.id 
          ? { 
              ...u, 
              ...formData as UserProfile,
              organization_name: organizationName 
            } 
          : u
      ));

      setSuccessMessage('User profile updated successfully');
    } catch (err) {
      setError('Failed to update user profile');
      console.error('Error updating user profile:', err);
    } finally {
      setSavingUser(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    setSelectedUser(null);
    setFormData({});
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div className="bg-white rounded-lg shadow p-6">
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
            {/* User list */}
            <div className="lg:w-1/3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">User Profiles</h3>
              {users.length === 0 ? (
                <div className="text-gray-500">No users found.</div>
              ) : (
                <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md overflow-hidden">
                  {users.map((userProfile) => (
                    <li 
                      key={userProfile.id}
                      className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${selectedUser?.id === userProfile.id ? 'bg-blue-50' : ''}`}
                      onClick={() => handleUserSelect(userProfile)}
                    >
                      <div className="font-medium text-gray-800">
                        {userProfile.display_name || `${userProfile.first_name} ${userProfile.last_name}`}
                      </div>
                      <div className="text-sm text-gray-500">{userProfile.email}</div>
                      <div className="text-xs flex justify-between mt-1">
                        <span className="bg-gray-100 text-gray-800 rounded-full px-2 py-0.5">
                          {userProfile.role || 'user'}
                        </span>
                        <span className="text-gray-500">
                          {userProfile.organization_name}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Edit form */}
            {isEditing && selectedUser && (
              <div className="lg:w-2/3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit User Profile</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="display_name" className="block text-sm font-medium text-gray-700">
                      Display Name
                    </label>
                    <input
                      type="text"
                      id="display_name"
                      name="display_name"
                      value={formData.display_name || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Optional. If not provided, first and last name will be displayed.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email || ''}
                      disabled
                      className="mt-1 block w-full border-2 border-gray-200 bg-gray-50 rounded-md shadow-sm text-gray-500 sm:text-sm cursor-not-allowed"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Email cannot be changed here.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                        Role
                      </label>
                      <select
                        id="role"
                        name="role"
                        value={formData.role || 'user'}
                        onChange={handleInputChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-2 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="organization_id" className="block text-sm font-medium text-gray-700">
                        Organization
                      </label>
                      <select
                        id="organization_id"
                        name="organization_id"
                        value={formData.organization_id || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-2 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="">No Organization</option>
                        {organizations.map((org) => (
                          <option key={org.id} value={org.id}>
                            {org.name}
                          </option>
                        ))}
                      </select>
                    </div>
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
                      disabled={savingUser}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {savingUser ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {!isEditing && !loading && (
              <div className="lg:w-2/3 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p>Select a user from the list to edit their profile.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 