import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '~/lib/supabase';
import { Editor } from '@tiptap/react';
import RichTextEditor from '~/components/RichTextEditor';

interface SectionEditorProps {
  sectionId: string;
}

interface SectionData {
  id: string;
  grant_application_id: string;
  grant_section_id: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  flow_order: number | null;
  grant_section: {
    id: string;
    name: string;
    instructions: string | null;
    ai_generator_prompt: string | null;
    ai_visualizations_prompt: string | null;
  };
}

interface SectionField {
  id: string;
  user_instructions: string;
  user_comments_on_ai_output?: string;
  ai_output?: string;
  created_at: string;
}

interface SectionDocument {
  id: string;
  file_name: string;
  file_type: string;
  file_path: string;
  created_at: string;
}

export default function SectionEditor({ sectionId }: SectionEditorProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Section data state
  const [section, setSection] = useState<SectionData | null>(null);
  const [currentField, setCurrentField] = useState<SectionField | null>(null);
  const [history, setHistory] = useState<SectionField[]>([]);
  const [showHistory, setShowHistory] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [documents, setDocuments] = useState<SectionDocument[]>([]);
  const [uploading, setUploading] = useState(false);

  // AI processing state
  const [selectedAIFunctions, setSelectedAIFunctions] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);

  // Load section data, history, and documents
  useEffect(() => {
    async function loadSectionData() {
      try {
        // Get section metadata with grant_section data
        const { data: sectionData, error: sectionError } = await supabase
          .from('grant_application_section')
          .select(`
            id,
            grant_application_id,
            grant_section_id,
            is_completed,
            created_at,
            updated_at,
            flow_order,
            grant_section:grant_section_id(
              id,
              name,
              instructions,
              ai_generator_prompt,
              ai_visualizations_prompt
            )
          `)
          .eq('id', sectionId)
          .maybeSingle() as { data: SectionData | null, error: any };

        if (sectionError) throw sectionError;
        if (!sectionData) {
          throw new Error(`No section found with ID: ${sectionId}`);
        }
        
        // Ensure grant_section is properly typed
        if (!sectionData.grant_section || Array.isArray(sectionData.grant_section)) {
          throw new Error('Invalid section data: grant_section is missing or malformed');
        }
        
        setSection(sectionData);

        // Get section fields history
        const { data: historyData, error: historyError } = await supabase
          .from('grant_application_section_fields')
          .select('*')
          .eq('grant_application_section_id', sectionId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (historyError) throw historyError;
        setHistory(historyData || []);
        
        // Set current field to latest version or create a new one
        if (historyData && historyData.length > 0) {
          setCurrentField(historyData[0]);
        } else {
          // Initialize with empty field if no history exists
          setCurrentField({
            id: 'new',
            user_instructions: '',
            created_at: new Date().toISOString()
          });
        }

        // Load documents
        const { data: documentData, error: documentError } = await supabase
          .from('grant_application_section_documents')
          .select('*')
          .eq('grant_application_section_id', sectionId);

        if (documentError) throw documentError;
        setDocuments(documentData || []);

      } catch (err) {
        console.error('Error loading section:', err);
        setError(err instanceof Error ? err.message : 'Failed to load section data');
      } finally {
        setLoading(false);
      }
    }

    loadSectionData();
  }, [sectionId]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !section) return;

    setUploading(true);
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${section.grant_application_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('grant-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create document record
      const { error: documentError } = await supabase
        .from('grant_application_section_documents')
        .insert({
          grant_application_section_id: sectionId,
          file_name: file.name,
          file_type: fileExt?.toLowerCase() || 'other',
          file_path: filePath
        });

      if (documentError) throw documentError;

      // Refresh documents list
      const { data: documentData, error: fetchError } = await supabase
        .from('grant_application_section_documents')
        .select('*')
        .eq('grant_application_section_id', sectionId);

      if (fetchError) throw fetchError;
      setDocuments(documentData || []);

    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownload = async (doc: SectionDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('grant-attachments')
        .download(doc.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download file');
    }
  };

  const handleDeleteAttachment = async (doc: SectionDocument) => {
    try {
      // Delete from Supabase Storage
      const { error: deleteError } = await supabase.storage
        .from('grant-attachments')
        .remove([doc.file_path]);

      if (deleteError) throw deleteError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('grant_application_section_documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;

      // Update local state
      setDocuments(prev => prev.filter(d => d.id !== doc.id));

    } catch (err) {
      console.error('Error deleting attachment:', err);
      setError('Failed to delete attachment');
    }
  };

  // Save changes
  const handleSave = async (andClose = false) => {
    if (!currentField || !section) return;
    
    setSaving(true);
    try {
      // Create new field record
      const { error: saveError } = await supabase
        .from('grant_application_section_fields')
        .insert({
          grant_application_section_id: sectionId,
          user_instructions: currentField.user_instructions,
          user_comments_on_ai_output: currentField.user_comments_on_ai_output,
          ai_output: currentField.ai_output
        });

      if (saveError) throw saveError;

      // Update completion status
      const { error: updateError } = await supabase
        .from('grant_application_section')
        .update({ is_completed: section.is_completed })
        .eq('id', sectionId);

      if (updateError) throw updateError;

      // Refresh history
      const { data: newHistory, error: historyError } = await supabase
        .from('grant_application_section_fields')
        .select('*')
        .eq('grant_application_section_id', sectionId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (historyError) throw historyError;
      setHistory(newHistory || []);

      // Navigate back to grant application if requested
      if (andClose) {
        navigate(`/dashboard/applications/${section.grant_application_id}`);
      }

    } catch (err) {
      console.error('Error saving:', err);
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // Load historical version
  const handleLoadVersion = async (versionId: string) => {
    const version = history.find(h => h.id === versionId);
    if (!version) return;

    try {
      // Save current state first
      await handleSave();
      // Load selected version
      setCurrentField(version);
    } catch (err) {
      console.error('Error loading version:', err);
      setError('Failed to load selected version');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!section || !currentField) return <div>No section data found</div>;

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1">
        {/* Main Content */}
        <div className="flex flex-1">
          {/* Left Column - Instructions and Inputs */}
          <div className="flex-1 p-6 border-r">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Instructions</h2>
              <p className="text-gray-600">{section.grant_section.instructions}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Instructions
              </label>
              <textarea
                value={currentField.user_instructions}
                onChange={(e) => setCurrentField(prev => 
                  prev ? { ...prev, user_instructions: e.target.value } : null
                )}
                className="w-full h-32 rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            {section.grant_section.ai_generator_prompt && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments on AI Output
                </label>
                <textarea
                  value={currentField.user_comments_on_ai_output || ''}
                  onChange={(e) => setCurrentField(prev => 
                    prev ? { ...prev, user_comments_on_ai_output: e.target.value } : null
                  )}
                  className="w-full h-32 rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            )}

            {section.grant_section.ai_generator_prompt && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">AI Functions</h3>
                <div className="space-y-2">
                  {section.grant_section.ai_generator_prompt && (
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedAIFunctions.includes('generator')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAIFunctions(prev => [...prev, 'generator']);
                          } else {
                            setSelectedAIFunctions(prev => prev.filter(f => f !== 'generator'));
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-900">Generate Content</span>
                    </label>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 mb-6">
              {section.grant_section.ai_visualizations_prompt && (
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Create Visuals
                </button>
              )}
              {section.grant_section.ai_generator_prompt && (
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Prompt AI
                </button>
              )}
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {saving ? 'Saving...' : 'Save & Close'}
              </button>
              <button
                onClick={() => {
                  setSection(prev => prev ? { ...prev, is_completed: true } : null);
                  handleSave(true);
                }}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Save & Complete
              </button>
            </div>

            {/* Attachments Section */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Attachments</h3>
              <div className="space-y-4">
                {/* File List */}
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">{doc.file_name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="text-sm text-indigo-600 hover:text-indigo-800"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => handleDeleteAttachment(doc)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Upload Button */}
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {uploading ? 'Uploading...' : 'Upload Attachment'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column - Rich Text Editor */}
          <div className="flex-1 p-6 border-r">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Content</h2>
              <button
                title="Send manual edits to AI for review and error correction"
                className="px-3 py-1 text-sm font-medium text-black bg-yellow-200 hover:bg-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Review Edits
              </button>
            </div>
            <RichTextEditor
              content={currentField.ai_output || ''}
              onChange={(content) => setCurrentField(prev => 
                prev ? { ...prev, ai_output: content } : null
              )}
            />
          </div>
        </div>

        {/* Right Margin - Version History */}
        <div className={`${showHistory ? 'w-64' : 'w-12'} transition-all duration-300 border-l bg-gray-50 flex`}>
          <div className="flex flex-col min-w-full">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 border-b"
              onClick={() => setShowHistory(!showHistory)}
            >
              <h3 className={`text-sm font-medium text-gray-900 ${!showHistory && 'sr-only'}`}>Version History</h3>
              <button className="text-gray-400 hover:text-gray-600">
                {showHistory ? '►' : '◄'}
              </button>
            </div>
            
            <div className={`${showHistory ? 'opacity-100' : 'opacity-0 hidden'} overflow-y-auto transition-opacity duration-300`} style={{ height: 'calc(100vh - 4rem)' }}>
              <div className="p-4 space-y-2">
                {history.map((version) => (
                  <button
                    key={version.id}
                    onClick={() => handleLoadVersion(version.id)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    {new Date(version.created_at).toLocaleString()}
                  </button>
                ))}
                {history.length >= 10 && (
                  <button className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700">
                    Load More
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 