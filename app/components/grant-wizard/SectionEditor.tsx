/**
 * Grant Section Editor
 * 
 * Rich text editor component for grant application sections.
 * Features AI-assisted content generation, document management,
 * and real-time collaboration capabilities.
 * 
 * Key Features:
 * - AI content generation and refinement
 * - Rich text editing with formatting
 * - Document attachments and management
 * - Version history tracking
 * - Real-time collaboration
 * - Auto-saving
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '~/lib/supabase';
import { Editor } from '@tiptap/react';
import RichTextEditor from '~/components/RichTextEditor';

interface SectionEditorProps {
  sectionId: string;
}

/**
 * Section data including content and metadata
 */
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

interface UserPrompt {
  id: string;
  name: string;
  description: string | null;
  prompt_text: string;
  is_active: boolean;
}

interface PromptModalData {
  isOpen: boolean;
  mode: 'add' | 'edit';
  prompt: {
    id?: string;
    name: string;
    description: string;
    prompt_text: string;
    is_active: boolean;
  };
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

  // Add user prompts state
  const [userPrompts, setUserPrompts] = useState<UserPrompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string>('default');
  const [loadingPrompts, setLoadingPrompts] = useState(false);

  const [promptModal, setPromptModal] = useState<PromptModalData>({
    isOpen: false,
    mode: 'add',
    prompt: {
      name: '',
      description: '',
      prompt_text: '',
      is_active: true
    }
  });

  // Separate loading states for each action
  const [isPrompting, setIsPrompting] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isCreatingVisuals, setIsCreatingVisuals] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);

  // Add state for tracking refinement stages
  const [refinementStage, setRefinementStage] = useState<'initial' | 'reviewing' | 'complete' | null>(null);

  // Add state for tracking selected version
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  // Add state for history pagination
  const [historyPage, setHistoryPage] = useState<number>(1);
  const [hasMoreHistory, setHasMoreHistory] = useState<boolean>(true);
  const HISTORY_PAGE_SIZE = 10;

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
          .range(0, HISTORY_PAGE_SIZE - 1);

        if (historyError) throw historyError;
        setHistory(historyData || []);
        setHasMoreHistory(historyData?.length === HISTORY_PAGE_SIZE);
        
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

  // Add loadUserPrompts effect
  useEffect(() => {
    async function loadUserPrompts() {
      if (!section?.grant_section.ai_generator_prompt) return;
      
      setLoadingPrompts(true);
      try {
        const { data, error } = await supabase
          .from('user_ai_prompts')
          .select('*')
          .eq('is_active', true)
          .is('deleted_at', null)
          .order('name');

        if (error) throw error;
        setUserPrompts(data || []);
      } catch (err) {
        console.error('Error loading prompts:', err);
        setError('Failed to load prompts');
      } finally {
        setLoadingPrompts(false);
      }
    }

    loadUserPrompts();
  }, [section?.grant_section.ai_generator_prompt]);

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
      const { data: docData, error: documentError } = await supabase
        .from('grant_application_section_documents')
        .insert({
          grant_application_section_id: sectionId,
          file_name: file.name,
          file_type: fileExt?.toLowerCase() || 'other',
          file_path: filePath,
          vectorization_status: 'pending'
        })
        .select()
        .single();

      if (documentError) throw documentError;
      if (!docData) throw new Error('No document data returned');

      // Add to processing queue
      const { error: queueError } = await supabase
        .from('document_processing_queue')
        .insert({
          document_id: docData.id,
          document_type: 'section',
          status: 'pending'
        });

      if (queueError) throw queueError;

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
      // 1. Delete vectors first
      const { error: vectorError } = await supabase
        .from('grant_application_section_document_vectors')
        .delete()
        .eq('document_id', doc.id);

      if (vectorError) throw vectorError;

      // 2. Delete from queue
      const { error: queueError } = await supabase
        .from('document_processing_queue')
        .delete()
        .eq('document_id', doc.id)
        .eq('document_type', 'section');

      if (queueError) throw queueError;

      // 3. Delete document record
      const { error: dbError } = await supabase
        .from('grant_application_section_documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;

      // 4. Finally delete from storage
      const { error: deleteError } = await supabase.storage
        .from('grant-attachments')
        .remove([doc.file_path]);

      if (deleteError) throw deleteError;

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
          ai_output: currentField.ai_output,
          ai_model: import.meta.env.OPENAI_MODEL
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
    try {
      // Fetch the complete version data
      const { data: version, error } = await supabase
        .from('grant_application_section_fields')
        .select('*')
        .eq('id', versionId)
        .single();

      if (error) throw error;
      if (!version) return;

      // Update selected version and display it
      setSelectedVersionId(versionId);
      setCurrentField(version);
    } catch (err) {
      console.error('Error loading version:', err);
      setError('Failed to load version');
    }
  };

  const handleOpenAddPrompt = () => {
    setPromptModal({
      isOpen: true,
      mode: 'add',
      prompt: {
        name: '',
        description: '',
        prompt_text: section?.grant_section.ai_generator_prompt || '',
        is_active: true
      }
    });
  };

  const handleOpenEditPrompt = () => {
    const promptToEdit = userPrompts.find(p => p.id === selectedPrompt);
    if (!promptToEdit) return;

    setPromptModal({
      isOpen: true,
      mode: 'edit',
      prompt: {
        id: promptToEdit.id,
        name: promptToEdit.name,
        description: promptToEdit.description || '',
        prompt_text: promptToEdit.prompt_text,
        is_active: promptToEdit.is_active
      }
    });
  };

  const handleClosePromptModal = () => {
    setPromptModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleSavePrompt = async () => {
    try {
      // Get current user's ID directly from auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      if (promptModal.mode === 'add') {
        const { error } = await supabase
          .from('user_ai_prompts')
          .insert({
            user_id: user.id, // Use auth user ID directly as profile ID
            name: promptModal.prompt.name,
            description: promptModal.prompt.description || null,
            prompt_text: promptModal.prompt.prompt_text,
            is_active: promptModal.prompt.is_active,
            prompt_type: 'generator'
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_ai_prompts')
          .update({
            name: promptModal.prompt.name,
            description: promptModal.prompt.description || null,
            prompt_text: promptModal.prompt.prompt_text,
            is_active: promptModal.prompt.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', promptModal.prompt.id);

        if (error) throw error;
      }

      // Refresh prompts list
      const { data, error } = await supabase
        .from('user_ai_prompts')
        .select('*')
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('name');

      if (error) throw error;
      setUserPrompts(data || []);
      handleClosePromptModal();
    } catch (err) {
      console.error('Error saving prompt:', err);
      setError('Failed to save prompt');
    }
  };

  const pollForUpdates = async (fieldId: string, attempt = 0) => {
    const MAX_ATTEMPTS = 90; // 3 minutes
    const INTERVAL = 2000; // 2 seconds

    if (attempt >= MAX_ATTEMPTS) {
      setIsPrompting(false);
      setError('Generation timed out. Please try again.');
      return;
    }

    try {
      const { data: fieldData, error } = await supabase
        .from('grant_application_section_fields')
        .select('*')
        .eq('id', fieldId)
        .single();

      if (error) throw error;

      // Only complete when we have content AND it's been reviewed
      if (fieldData?.ai_output && fieldData.ai_model?.includes('assistant-reviewed')) {
        setCurrentField(fieldData);
        setIsPrompting(false);
        await refreshHistory();
        return;
      }

      // No reviewed content yet - keep polling
      await new Promise(resolve => setTimeout(resolve, INTERVAL));
      await pollForUpdates(fieldId, attempt + 1);

    } catch (error) {
      console.error('Error polling for updates:', error);
      setIsPrompting(false);
      setError('Error checking generation status');
    }
  };

  const handlePromptAI = async () => {
    if (!section || !currentField || isPrompting) return;
    
    setIsPrompting(true);
    setError(null);
    
    try {
      // Save current state if needed
      if (currentField.ai_output && currentField.id !== 'new') {
        const { error: saveError } = await supabase
          .from('grant_application_section_fields')
          .insert({
            grant_application_section_id: sectionId,
            user_instructions: currentField.user_instructions,
            user_comments_on_ai_output: currentField.user_comments_on_ai_output,
            ai_output: currentField.ai_output,
            ai_model: import.meta.env.OPENAI_MODEL
          });

        if (saveError) throw saveError;
      }

      // Create new field for AI generation
      const { data: newField, error: createError } = await supabase
        .from('grant_application_section_fields')
        .insert({
          grant_application_section_id: sectionId,
          user_instructions: currentField.user_instructions,
          user_comments_on_ai_output: currentField.user_comments_on_ai_output,
          ai_output: null,
          ai_model: import.meta.env.OPENAI_MODEL
        })
        .select()
        .single();

      if (createError) throw createError;
      if (!newField) throw new Error('Failed to create new field record');

      // Get the selected prompt text
      const promptText = selectedPrompt === 'default' 
        ? section.grant_section.ai_generator_prompt 
        : userPrompts.find(p => p.id === selectedPrompt)?.prompt_text;

      if (!promptText) {
        throw new Error('No prompt text available');
      }

      // Get the user's session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Call the edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/prompt-ai`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            section_id: sectionId,
            field_id: newField.id,
            prompt_id: selectedPrompt === 'default' ? undefined : selectedPrompt
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to start generation');
      }

      // Start polling
      pollForUpdates(newField.id);

    } catch (err) {
      console.error('Error in AI generation:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate content');
      setIsPrompting(false);
    }
  };

  // Update the UI to show refinement progress
  const getRefinementStatus = () => {
    if (!isPrompting) return 'Generate';
    switch (refinementStage) {
      case 'initial':
        return 'Generating content...';
      case 'reviewing':
        return 'Reviewing content...';
      case 'complete':
        return 'Generation complete';
      default:
        return 'Generating...';
    }
  };

  // Add refreshHistory function
  const refreshHistory = async () => {
    try {
      const { data: newHistory, error: historyError } = await supabase
        .from('grant_application_section_fields')
        .select('*')
        .eq('grant_application_section_id', sectionId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (historyError) throw historyError;
      setHistory(newHistory || []);
      
      // Update current field if we have new history
      if (newHistory && newHistory.length > 0) {
        setCurrentField(newHistory[0]);
      }
    } catch (err) {
      console.error('Error refreshing history:', err);
      setError('Failed to refresh history');
    }
  };

  const handleReviewEdits = async () => {
    if (!section || !currentField?.ai_output) return;
    
    setIsReviewing(true);
    try {
      // Get the user's session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Save current edits first
      const { data: savedField, error: saveError } = await supabase
        .from('grant_application_section_fields')
        .insert({
          grant_application_section_id: sectionId,
          user_instructions: currentField.user_instructions,
          user_comments_on_ai_output: currentField.user_comments_on_ai_output,
          ai_output: currentField.ai_output,
          ai_model: import.meta.env.OPENAI_MODEL
        })
        .select()
        .single();

      if (saveError) throw saveError;
      if (!savedField) throw new Error('Failed to save current edits');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/review-edits`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            section_id: sectionId,
            field_id: savedField.id
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to review text');
      }

      const result = await response.json();
      
      if (result.data?.ai_output) {
        // Get the latest field data including the reviewed text
        const { data: latestField, error: fetchError } = await supabase
          .from('grant_application_section_fields')
          .select('*')
          .eq('id', result.data.field_id)
          .single();

        if (fetchError) throw fetchError;
        if (!latestField) throw new Error('Failed to fetch reviewed text');

        // Update the current field with all the latest data
        setCurrentField(latestField);

        // Refresh history
        const { data: newHistory, error: historyError } = await supabase
          .from('grant_application_section_fields')
          .select('*')
          .eq('grant_application_section_id', sectionId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (historyError) throw historyError;
        setHistory(newHistory || []);
      } else {
        throw new Error('No reviewed text received');
      }
    } catch (err) {
      console.error('Error reviewing text:', err);
      setError(err instanceof Error ? err.message : 'Failed to review text');
    } finally {
      setIsReviewing(false);
    }
  };

  const handleCreateVisuals = async () => {
    if (!section || !currentField?.user_instructions) return;
    
    setIsCreatingVisuals(true);
    try {
      // First save the current field to history
      const { data: savedField, error: saveError } = await supabase
        .from('grant_application_section_fields')
        .insert({
          grant_application_section_id: sectionId,
          user_instructions: currentField.user_instructions,
          ai_model: 'create-visuals'
        })
        .select()
        .single();

      if (saveError) throw saveError;
      if (!savedField) throw new Error('Failed to save field record');

      // Find image filename in user instructions
      const imageMatch = currentField.user_instructions.match(/([a-zA-Z0-9-]+\.(?:png|jpg|jpeg|gif))/i);
      if (!imageMatch) {
        throw new Error('No image filename found in instructions');
      }
      const imageFilename = imageMatch[1];

      // Find the referenced document
      const { data: docData, error: docError } = await supabase
        .from('grant_application_section_documents')
        .select('*')
        .eq('grant_application_section_id', sectionId)
        .eq('file_name', imageFilename)
        .single();

      if (docError) throw docError;
      if (!docData) {
        throw new Error(`Image "${imageFilename}" not found in attachments`);
      }

      // Get the user's session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-visuals`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            section_id: sectionId,
            field_id: savedField.id,
            image_path: docData.file_path
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create visual');
      }

      const result = await response.json();
      
      if (result.success) {
        // Refresh documents list to show new visual
        const { data: documentData, error: fetchError } = await supabase
          .from('grant_application_section_documents')
          .select('*')
          .eq('grant_application_section_id', sectionId);

        if (fetchError) throw fetchError;
        setDocuments(documentData || []);

        // Refresh history
        const { data: newHistory, error: historyError } = await supabase
          .from('grant_application_section_fields')
          .select('*')
          .eq('grant_application_section_id', sectionId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (historyError) throw historyError;
        setHistory(newHistory || []);
      } else {
        throw new Error('Failed to create visual');
      }
    } catch (err) {
      console.error('Error creating visual:', err);
      setError(err instanceof Error ? err.message : 'Failed to create visual');
    } finally {
      setIsCreatingVisuals(false);
    }
  };

  const handleLoadMore = async () => {
    try {
      const start = historyPage * HISTORY_PAGE_SIZE;
      const end = start + HISTORY_PAGE_SIZE - 1;

      const { data: moreHistory, error } = await supabase
        .from('grant_application_section_fields')
        .select('*')
        .eq('grant_application_section_id', sectionId)
        .order('created_at', { ascending: false })
        .range(start, end);

      if (error) throw error;

      if (moreHistory) {
        setHistory(prev => [...prev, ...moreHistory]);
        setHasMoreHistory(moreHistory.length === HISTORY_PAGE_SIZE);
        setHistoryPage(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error loading more history:', err);
      setError('Failed to load more history');
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
                value={currentField?.user_instructions ?? ''}
                onChange={(e) => setCurrentField(prev => 
                  prev ? { ...prev, user_instructions: e.target.value } : null
                )}
                className="w-full h-32 rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 overflow-y-auto resize-y min-h-[8rem] max-h-[24rem]"
              />
            </div>

            {section.grant_section.ai_generator_prompt && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments on AI Output
                </label>
                <textarea
                  value={currentField?.user_comments_on_ai_output ?? ''}
                  onChange={(e) => setCurrentField(prev => 
                    prev ? { ...prev, user_comments_on_ai_output: e.target.value } : null
                  )}
                  className="w-full h-32 rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 overflow-y-auto resize-y min-h-[8rem] max-h-[24rem]"
                />
              </div>
            )}

            {section.grant_section.ai_generator_prompt && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">AI Prompts</h3>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedPrompt}
                    onChange={(e) => setSelectedPrompt(e.target.value)}
                    className="flex-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    disabled={loadingPrompts}
                  >
                    <option value="default">Default Section Prompt</option>
                    {userPrompts.map((prompt) => (
                      <option key={prompt.id} value={prompt.id}>
                        {prompt.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleOpenAddPrompt}
                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add
                  </button>
                  <button
                    onClick={handleOpenEditPrompt}
                    disabled={selectedPrompt === 'default'}
                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}

            {/* Prompt Modal */}
            {promptModal.isOpen && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {promptModal.mode === 'add' ? 'Add New Prompt' : 'Edit Prompt'}
                    </h3>
                    <button
                      onClick={handleClosePromptModal}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <span className="sr-only">Close</span>
                      ×
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="prompt-name" className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <input
                        type="text"
                        id="prompt-name"
                        value={promptModal.prompt.name}
                        onChange={(e) => setPromptModal(prev => ({
                          ...prev,
                          prompt: { ...prev.prompt, name: e.target.value }
                        }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="prompt-description" className="block text-sm font-medium text-gray-700">
                        Description (Optional)
                      </label>
                      <input
                        type="text"
                        id="prompt-description"
                        value={promptModal.prompt.description}
                        onChange={(e) => setPromptModal(prev => ({
                          ...prev,
                          prompt: { ...prev.prompt, description: e.target.value }
                        }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="prompt-text" className="block text-sm font-medium text-gray-700">
                        Prompt Text
                      </label>
                      <textarea
                        id="prompt-text"
                        rows={6}
                        value={promptModal.prompt.prompt_text}
                        onChange={(e) => setPromptModal(prev => ({
                          ...prev,
                          prompt: { ...prev.prompt, prompt_text: e.target.value }
                        }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="prompt-active"
                        checked={promptModal.prompt.is_active}
                        onChange={(e) => setPromptModal(prev => ({
                          ...prev,
                          prompt: { ...prev.prompt, is_active: e.target.checked }
                        }))}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="prompt-active" className="ml-2 block text-sm text-gray-900">
                        Active
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={handleClosePromptModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSavePrompt}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {promptModal.mode === 'add' ? 'Add Prompt' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 mb-6">
              {section.grant_section.ai_visualizations_prompt && (
                <button
                  type="button"
                  onClick={handleCreateVisuals}
                  disabled={isCreatingVisuals || !currentField?.user_instructions || documents.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingVisuals ? 'Creating...' : 'Create Visuals'}
                </button>
              )}
              {section.grant_section.ai_generator_prompt && (
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  onClick={handlePromptAI}
                  disabled={isPrompting}
                >
                  {getRefinementStatus()}
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
                onClick={handleReviewEdits}
                disabled={isReviewing || !currentField?.ai_output}
              >
                {isReviewing ? 'Reviewing...' : 'Review Edits'}
              </button>
            </div>
            <div className="h-[calc(100vh-12rem)] overflow-y-auto resize-y min-h-[24rem] max-h-[calc(100vh-8rem)] border rounded-md">
              <RichTextEditor
                content={currentField?.ai_output || ''}
                onChange={(content) => setCurrentField(prev => 
                  prev ? { ...prev, ai_output: content } : null
                )}
              />
            </div>
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
                    className={`w-full text-left px-3 py-2 text-sm ${
                      selectedVersionId === version.id 
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                        : 'text-gray-700 hover:bg-gray-100'
                    } rounded-md`}
                  >
                    {new Date(version.created_at).toLocaleString()}
                  </button>
                ))}
                {hasMoreHistory && (
                  <button 
                    onClick={handleLoadMore}
                    className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 py-2"
                  >
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