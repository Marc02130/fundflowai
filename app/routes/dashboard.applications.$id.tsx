/**
 * Single Application View
 * 
 * Detailed view of a grant application with section management
 * and AI-assisted content generation.
 * 
 * Features:
 * - Section status tracking
 * - AI content generation
 * - Document management
 * - Real-time collaboration
 * 
 * @route /dashboard/applications/:id
 */

import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
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

interface SectionData {
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

type OutletContext = {
  setSectionName: (name: string | null) => void;
};

// Sanitize file name for storage
const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace any non-alphanumeric chars (except . and -) with _
    .replace(/_{2,}/g, '_'); // Replace multiple consecutive underscores with a single one
};

/**
 * Single Application Component
 * 
 * @component
 * @param {Object} props - Component props
 */
export default function GrantApplicationView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setSectionName } = useOutletContext<OutletContext>();
  const [application, setApplication] = useState<GrantApplication | null>(null);
  const [sections, setSections] = useState<ApplicationSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [generating, setGenerating] = useState(false);
  const [researching, setResearching] = useState(false);

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
        setSectionName(appData.title);

        // Get file metadata from storage
        const { data: storageFiles } = await supabase.storage
          .from('grant-attachments')
          .list(appData.id);

        // Check if deep_research.md exists
        const hasDeepResearch = storageFiles?.some(file => file.name === 'deep_research.md');
        if (hasDeepResearch) {
          setResearching(false);
        }

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
        const sectionsData = data as unknown as SectionData[];
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
    return () => setSectionName(null);
  }, [id, setSectionName]);

  const handleUpdateStatus = async (newStatus: 'submitted' | 'cancelled') => {
    try {
      setUpdating(true);
      const { error } = await supabase
        .from('grant_applications')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Refresh unsubmitted grants list
      (window as any).refreshUnsubmittedGrants?.();

      navigate('/dashboard/applications');
    } catch (error) {
      console.error('Error updating application status:', error);
      setError('Failed to update application status');
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
        const sanitizedName = sanitizeFileName(file.name);
        const filePath = `${application.id}/${fileId}-${sanitizedName}`;

        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('grant-attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Create document record
        const { data: doc, error: documentError } = await supabase
          .from('grant_application_documents')
          .insert({
            id: fileId,
            grant_application_id: application.id,
            file_name: file.name,
            file_type: file.type.split('/').pop()?.toLowerCase() || 'other',
            file_path: filePath,
            vectorization_status: 'pending'
          })
          .select()
          .single();

        if (documentError) throw documentError;

        // Queue document for processing
        const { error: queueError } = await supabase
          .rpc('queue_document_for_processing', {
            p_document_id: fileId,
            p_document_type: 'application'
          });

        if (queueError) throw queueError;

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
      // Check authentication status
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Attempting deletion with user:', user?.id);
      console.log('Application ID:', application.id);
      console.log('Document ID:', attachmentId);

      const attachment = attachments.find(a => a.id === attachmentId);
      if (!attachment) return;

      // Delete from queue first (if exists)
      const { error: queueError } = await supabase
        .from('document_processing_queue')
        .delete()
        .eq('document_id', attachmentId)
        .eq('document_type', 'application');

      if (queueError) throw queueError;

      // Delete vectors
      const { error: vectorError } = await supabase
        .from('grant_application_document_vectors')
        .delete()
        .eq('document_id', attachmentId);

      if (vectorError) throw vectorError;

      // Delete document record
      const { error: dbError } = await supabase
        .from('grant_application_documents')
        .delete()
        .eq('id', attachmentId);

      if (dbError) throw dbError;

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('grant-attachments')
        .remove([attachment.file_path]);

      if (deleteError) throw deleteError;

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

  const handleGenerateGrant = async () => {
    if (!id || generating) return;

    try {
      setGenerating(true);
      setError(null);

      // Get the user's session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Call the edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-grant`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            application_id: id
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate grant');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error('Failed to generate grant');
      }

      // Refresh sections data to show updated status
      const { data: updatedSections, error: sectionsError } = await supabase
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

      // Transform and update sections
      // Note: Explicitly type the data to fix TypeScript errors
      type SectionWithData = {
        id: string;
        is_completed: boolean;
        flow_order: number;
        grant_sections: {
          name: string;
          description: string | null;
        };
      };

      const transformedSections = (updatedSections as unknown as SectionWithData[])?.map(section => ({
        id: section.id,
        name: section.grant_sections.name,
        description: section.grant_sections.description,
        flow_order: section.flow_order,
        is_completed: section.is_completed
      })) || [];

      setSections(transformedSections);

    } catch (error) {
      console.error('Error generating grant:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate grant');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeepResearch = () => {
    if (!id || researching) return;
    navigate(`/dashboard/applications/${id}/research`);
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
  const hasAttachments = attachments.length > 0;
  const hasDescription = Boolean(application.description?.trim());
  const canGenerateGrant = hasAttachments && hasDescription;

  return (
    <div className="w-4/5 mx-auto py-8 px-4">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          {/* Action Buttons */}
          <div className="flex justify-between items-center mb-6">
            {/* Left side buttons */}
            <div className="flex space-x-4">
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
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
                >
                  <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 5.5a.75.75 0 01.75.75v6.043l1.446-1.446a.75.75 0 111.06 1.06l-2.756 2.757a.75.75 0 01-1.06 0L6.684 11.907a.75.75 0 111.06-1.06l1.446 1.446V6.25A.75.75 0 0110 5.5z" />
                    <path d="M5.507 4.507C7.254 2.76 9.613 2 12 2c2.387 0 4.746.76 6.493 2.507 1.747 1.747 2.507 4.106 2.507 6.493 0 2.387-.76 4.746-2.507 6.493C16.746 19.24 14.387 20 12 20c-2.387 0-4.746-.76-6.493-2.507C3.76 15.746 3 13.387 3 11c0-2.387.76-4.746 2.507-6.493z" />
                  </svg>
                  {uploading ? 'Uploading...' : 'Add Attachments'}
                </button>
              </div>
              <button
                onClick={handleDeepResearch}
                disabled={!canGenerateGrant || researching}
                title={!canGenerateGrant ? 'Requires description and attachments to generate research' : ''}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  canGenerateGrant && !researching
                    ? 'bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <svg className={`mr-2 -ml-1 h-5 w-5 ${researching ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  {researching ? (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  )}
                </svg>
                {researching ? 'Researching...' : 'Research Assistant'}
              </button>
              <button
                onClick={handleGenerateGrant}
                disabled={!canGenerateGrant || generating}
                title={!canGenerateGrant ? 'Requires description and attachments to generate grant' : ''}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  canGenerateGrant && !generating
                    ? 'bg-indigo-800 hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-800'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <svg className={`mr-2 -ml-1 h-5 w-5 ${generating ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  {generating ? (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  ) : (
                    <path d="M10 3.75a2 2 0 10-4 0 2 2 0 004 0zM17.25 4.5a.75.75 0 00-1.5 0v5.15a3.72 3.72 0 01-2.875 3.622l-1.95.39a.75.75 0 00-.525.67v5.332c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75v-4.923l1.95-.39a5.22 5.22 0 004.042-5.083V4.5zM5.75 15.75a.75.75 0 00-.75.75v2.752a.75.75 0 101.5 0v-2.752a.75.75 0 00-.75-.75zm7.5-12a.75.75 0 00-.75.75v2.752a.75.75 0 101.5 0V4.5a.75.75 0 00-.75-.75z" />
                  )}
                </svg>
                {generating ? 'Generating...' : 'Generate Grant'}
              </button>
            </div>

            {/* Right side buttons */}
            {isInProgress && (
              <div className="flex space-x-4">
                <button
                  onClick={() => handleUpdateStatus('submitted')}
                  disabled={updating}
                  className={`px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700'`}
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
              </div>
            )}
          </div>

          {/* Create date below buttons */}
          <div className="text-sm text-gray-500">
            Created {new Date(application.created_at).toLocaleDateString()}
            {application.updated_at && ` • Last updated ${new Date(application.updated_at).toLocaleDateString()}`}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <h2 className="text-sm font-medium text-gray-500">Status</h2>
            <p className="mt-1 text-lg text-left">{application.status}</p>
          </div>
          <div className="text-center">
            <h2 className="text-sm font-medium text-gray-500">Resubmission</h2>
            <p className="mt-1 text-lg">{application.resubmission ? 'Yes' : 'No'}</p>
          </div>
          <div className="text-right">
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
