import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  amount_requested?: number;
}

interface ApplicationSection {
  id: string;
  name: string;
  description: string | null;
  flow_order: number;
  is_completed: boolean;
}

interface SectionResponse {
  id: string;
  is_completed: boolean;
  flow_order: number;
  grant_sections: {
    name: string;
    description: string | null;
  };
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  file_path: string;
}

export default function GrantApplicationView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState<GrantApplication | null>(null);
  const [sections, setSections] = useState<ApplicationSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchApplicationData() {
      try {
        // Fetch application details
        const { data: appData, error: appError } = await supabase
          .from('grant_applications')
          .select('*')
          .eq('id', id)
          .single();

        if (appError) throw appError;
        setApplication(appData);

        // Get file metadata from storage
        const { data: storageFiles } = await supabase.storage
          .from('grant-attachments')
          .list(appData.id);

        // Fetch sections with their completion status
        const { data, error: sectionsError } = await supabase
          .from('grant_application_section')
          .select(`
            id,
            is_completed,
            flow_order,
            grant_sections (
              name,
              description
            )
          `)
          .eq('grant_application_id', id)
          .order('flow_order');

        if (sectionsError) throw sectionsError;

        // Transform the data to match our interface
        const sectionsData = data as unknown as SectionResponse[];
        const transformedSections = sectionsData.map(section => ({
          id: section.id,
          name: section.grant_sections.name,
          description: section.grant_sections.description,
          flow_order: section.flow_order,
          is_completed: section.is_completed
        }));

        setSections(transformedSections);

        // Load existing attachments
        const { data: documentData, error: documentError } = await supabase
          .from('grant_application_documents')
          .select('*')
          .eq('grant_application_id', id);

        if (documentError) throw documentError;

        // Transform into attachments format with size from storage metadata
        const attachmentsList = documentData?.map(doc => {
          const storageFile = storageFiles?.find(f => f.name === doc.file_path.split('/').pop());
          return {
            id: doc.id,
            name: doc.file_name,
            size: storageFile?.metadata?.size || 0,
            type: doc.file_type,
            uploadedAt: new Date(doc.created_at),
            file_path: doc.file_path
          };
        }) || [];

        setAttachments(attachmentsList);
      } catch (err) {
        console.error('Error fetching application data:', err);
        setError('Failed to load application');
      } finally {
        setLoading(false);
      }
    }

    fetchApplicationData();
  }, [id]);

  const handleUpdateStatus = async (newStatus: 'cancelled' | 'submitted') => {
    if (!application || updating) return;
    
    try {
      setUpdating(true);
      const { error: updateError } = await supabase
        .from('grant_applications')
        .update({ status: newStatus })
        .eq('id', application.id);

      if (updateError) throw updateError;

      // Update local state
      setApplication(prev => prev ? { ...prev, status: newStatus } : null);

      // Navigate back to dashboard for both cancel and submit
      navigate('/dashboard');
    } catch (err) {
      console.error(`Error ${newStatus === 'cancelled' ? 'cancelling' : 'submitting'} application:`, err);
      setError(`Failed to ${newStatus === 'cancelled' ? 'cancel' : 'submit'} application`);
    } finally {
      setUpdating(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !application) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fileId = crypto.randomUUID();
        const filePath = `${application.id}/${fileId}-${file.name}`;

        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('grant-attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Create document record
        const { error: documentError } = await supabase
          .from('grant_application_documents')
          .insert({
            grant_application_id: application.id,
            file_name: file.name,
            file_type: file.type.split('/').pop()?.toLowerCase() || 'other',
            file_path: filePath
          });

        if (documentError) throw documentError;

        // Add to attachments list
        setAttachments(prev => [...prev, {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date(),
          file_path: filePath
        }]);
      }
    } catch (err) {
      console.error('Error uploading files:', err);
      setError('Failed to upload attachments');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!application) return;

    try {
      const attachment = attachments.find(a => a.id === attachmentId);
      if (!attachment) return;

      const filePath = `${application.id}/${attachmentId}-${attachment.name}`;
      
      // Delete from Supabase Storage
      const { error: deleteError } = await supabase.storage
        .from('grant-attachments')
        .remove([filePath]);

      if (deleteError) throw deleteError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('grant_application_documents')
        .delete()
        .eq('id', attachmentId);

      if (dbError) throw dbError;

      // Remove from attachments list
      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
    } catch (err) {
      console.error('Error deleting attachment:', err);
      setError('Failed to delete attachment');
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      const { data, error } = await supabase.storage
        .from('grant-attachments')
        .download(attachment.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download file');
    }
  };

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

  const isInProgress = application.status === 'in-progress';
  const allSectionsCompleted = sections.every(section => section.is_completed);
  const hasAttachments = attachments.length > 0;
  const hasDescription = Boolean(application.description?.trim());
  const canGenerateGrant = hasAttachments && hasDescription;

  return (
    <div className="w-4/5 mx-auto py-8 px-4">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{application.title}</h1>
              <p className="text-sm text-gray-500">
                Created {new Date(application.created_at).toLocaleDateString()}
                {application.updated_at && ` • Last updated ${new Date(application.updated_at).toLocaleDateString()}`}
              </p>
            </div>
            <div className="flex space-x-4">
              {isInProgress && (
                <>
                  <button
                    onClick={() => handleUpdateStatus('submitted')}
                    disabled={updating || !allSectionsCompleted}
                    className={`px-4 py-2 rounded-md text-white ${
                      allSectionsCompleted
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                    title={!allSectionsCompleted ? 'All sections must be completed before submitting' : ''}
                  >
                    {updating ? 'Submitting...' : 'Submit'}
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('cancelled')}
                    disabled={updating}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                  >
                    {updating ? 'Cancelling...' : 'Cancel'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mb-6">
          <button
            onClick={() => {/* TODO: Implement generate functionality */}}
            disabled={!canGenerateGrant}
            title={!canGenerateGrant ? 'Requires description and attachments to generate grant' : ''}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              canGenerateGrant 
                ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 3.75a2 2 0 10-4 0 2 2 0 004 0zM17.25 4.5a.75.75 0 00-1.5 0v5.15a3.72 3.72 0 01-2.875 3.622l-1.95.39a.75.75 0 00-.525.67v5.332c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75v-4.923l1.95-.39a5.22 5.22 0 004.042-5.083V4.5zM5.75 15.75a.75.75 0 00-.75.75v2.752a.75.75 0 101.5 0v-2.752a.75.75 0 00-.75-.75zm7.5-12a.75.75 0 00-.75.75v2.752a.75.75 0 101.5 0V4.5a.75.75 0 00-.75-.75z" />
            </svg>
            Generate Grant
          </button>
          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 5.5a.75.75 0 01.75.75v6.043l1.446-1.446a.75.75 0 111.06 1.06l-2.756 2.757a.75.75 0 01-1.06 0L6.684 11.907a.75.75 0 111.06-1.06l1.446 1.446V6.25A.75.75 0 0110 5.5z" />
                <path d="M5.507 4.507C7.254 2.76 9.613 2 12 2c2.387 0 4.746.76 6.493 2.507 1.747 1.747 2.507 4.106 2.507 6.493 0 2.387-.76 4.746-2.507 6.493C16.746 19.24 14.387 20 12 20c-2.387 0-4.746-.76-6.493-2.507C3.76 15.746 3 13.387 3 11c0-2.387.76-4.746 2.507-6.493z" />
              </svg>
              {uploading ? 'Uploading...' : 'Add Attachments'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <h2 className="text-sm font-medium text-gray-500">Status</h2>
            <p className="mt-1 text-lg">{application.status}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">Resubmission</h2>
            <p className="mt-1 text-lg">{application.resubmission ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">Amount Requested</h2>
            <p className="mt-1 text-lg">
              {application.amount_requested 
                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(application.amount_requested)
                : 'Not specified'
              }
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Description</h2>
          <p className="text-gray-900">{application.description}</p>
        </div>

        {/* Sections */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Sections</h2>
          <div className="space-y-4">
            {sections.map((section) => (
              <div 
                key={section.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">{section.name}</h3>
                    {section.description && (
                      <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                    )}
                  </div>
                  <div className="flex items-center">
                    {section.is_completed ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        In Progress
                      </span>
                    )}
                    <button
                      className="ml-4 text-sm text-blue-600 hover:text-blue-800"
                      onClick={() => navigate(`/dashboard/applications/${id}/sections/${section.id}`)}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attachments Section */}
        <div className="border-t pt-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Attachments</h2>
          {attachments.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {attachments.map((attachment) => (
                <li key={attachment.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-gray-400 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                      <p className="text-sm text-gray-500">
                        {(attachment.size / 1024).toFixed(1)} KB • {attachment.uploadedAt.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleDownload(attachment)}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDeleteAttachment(attachment.id)}
                      className="text-sm font-medium text-red-600 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No attachments yet</p>
          )}
        </div>
      </div>
    </div>
  );
} 