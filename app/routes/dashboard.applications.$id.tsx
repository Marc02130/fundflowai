import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '~/lib/supabase';

interface GrantApplication {
  id: string;
  title: string;
  description: string;
  status: string;
  grant_type_id: string;
  resubmission: boolean;
  grant_opportunity_id: string;
  created_at: string;
  updated_at: string;
}

export default function GrantApplicationView() {
  const { id } = useParams();
  const [application, setApplication] = useState<GrantApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchApplication() {
      try {
        const { data, error } = await supabase
          .from('grant_applications')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setApplication(data);
      } catch (err) {
        console.error('Error fetching application:', err);
        setError('Failed to load application');
      } finally {
        setLoading(false);
      }
    }

    fetchApplication();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
          Application not found
        </div>
      </div>
    );
  }

  return (
    <div className="w-4/5 mx-auto py-8 px-4">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{application.title}</h1>
          <p className="text-sm text-gray-500">
            Created {new Date(application.created_at).toLocaleDateString()}
            {application.updated_at && ` • Last updated ${new Date(application.updated_at).toLocaleDateString()}`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-sm font-medium text-gray-500">Status</h2>
            <p className="mt-1 text-lg">{application.status}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">Resubmission</h2>
            <p className="mt-1 text-lg">{application.resubmission ? 'Yes' : 'No'}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Description</h2>
          <p className="text-gray-900">{application.description}</p>
        </div>

        {/* File upload section will be added here */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Attachments</h2>
          <p className="text-gray-500">File upload functionality coming soon...</p>
        </div>
      </div>
    </div>
  );
} 