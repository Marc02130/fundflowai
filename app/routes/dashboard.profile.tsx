import { useState } from 'react';
import { useAuth } from '~/context/AuthContext';

export function meta() {
  return [
    { title: "Your Profile - Fund Flow AI" },
    { name: "description", content: "Manage your Fund Flow AI profile" },
  ];
}

export default function Profile() {
  const { profile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    display_name: profile?.display_name || '',
    email: profile?.email || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });
    
    try {
      const { error } = await updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        display_name: formData.display_name,
      });
      
      if (error) {
        throw error;
      }
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = () => {
    setFormData({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      display_name: profile?.display_name || '',
      email: profile?.email || '',
    });
    setIsEditing(true);
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="px-6 py-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      
      {message.text && (
        <div 
          className={`p-4 mb-6 rounded-md ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}
      
      {!isEditing ? (
        <div>
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-sm font-medium text-gray-500">First Name</h2>
                <p className="mt-1 text-lg">{profile?.first_name || 'Not set'}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500">Last Name</h2>
                <p className="mt-1 text-lg">{profile?.last_name || 'Not set'}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500">Display Name</h2>
                <p className="mt-1 text-lg">{profile?.display_name || 'Not set'}</p>
              </div>
              {profile?.organization_id && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500">Organization</h2>
                  <p className="mt-1 text-lg text-gray-700">
                    {profile.organization_id}
                    <span className="text-xs text-gray-500 ml-2">(Can't be changed by user)</span>
                  </p>
                </div>
              )}
            </div>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleEditClick}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                id="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                id="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="display_name" className="block text-sm font-medium text-gray-700">
                Display Name
              </label>
              <input
                type="text"
                name="display_name"
                id="display_name"
                value={formData.display_name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            {profile?.organization_id && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Organization
                </label>
                <div className="mt-1 block w-full py-2 px-3 rounded-md bg-gray-100 text-gray-500 sm:text-sm">
                  {profile.organization_id}
                  <span className="text-xs ml-2">(Can't be changed)</span>
                </div>
              </div>
            )}
          </div>
          <div className="mt-6 flex items-center gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 