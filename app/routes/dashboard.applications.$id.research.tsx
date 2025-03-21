import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '~/lib/supabase';

interface ResearchInteraction {
  id: string;
  content: string;
  interaction_type: 'ai_output' | 'user_response' | 'ai_response';
  has_generated_report: boolean;
  created_at: string;
  updated_at: string;
}

type OutletContext = {
  setSectionName: (name: string | null) => void;
};

export default function ResearchWindow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setSectionName } = useOutletContext<OutletContext>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interactions, setInteractions] = useState<ResearchInteraction[]>([]);
  const [selectedInteraction, setSelectedInteraction] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    setSectionName('Deep Research');
    return () => setSectionName(null);
  }, [setSectionName]);

  useEffect(() => {
    if (!hasInitialized.current) {
      loadInteractions();
      hasInitialized.current = true;
    }
  }, [id]);

  async function loadInteractions() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('grant_application_deep_research')
        .select('*')
        .eq('grant_application_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // If no records exist, initiate research
      if (!data || data.length === 0) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No active session');

        // Get application data for initial context
        const { data: appData, error: appError } = await supabase
          .from('grant_applications')
          .select('description')
          .eq('id', id)
          .single();
        
        if (appError) throw appError;

        // Get document vectors
        const { data: vectors, error: vectorError } = await supabase
          .from('grant_application_documents')
          .select(`
            id,
            vectors:grant_application_document_vectors(
              id,
              vector
            )
          `)
          .eq('grant_application_id', id);

        if (vectorError) throw vectorError;

        // Initialize research with context
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/deep-research`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              application_id: id,
              initialize: true,
              context: {
                description: appData.description,
                documents: vectors
              }
            })
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to initialize research');
        }

        // Wait a moment for the database to be updated
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Query one more time to get the new record
        const { data: newData, error: newError } = await supabase
          .from('grant_application_deep_research')
          .select('*')
          .eq('grant_application_id', id)
          .order('created_at', { ascending: true });

        if (newError) throw newError;
        setInteractions(newData || []);
        if (newData?.length > 0) {
          setSelectedInteraction(newData[newData.length - 1].id);
        }
        return;
      }

      setInteractions(data);
      // Select the most recent interaction by default
      if (data.length > 0) {
        setSelectedInteraction(data[data.length - 1].id);
      }
    } catch (err) {
      console.error('Error loading interactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load research interactions');
    } finally {
      setLoading(false);
    }
  }

  // Add helper function to parse AI content
  function parseAIContent(content: string) {
    try {
      return JSON.parse(content);
    } catch (e) {
      console.error('Error parsing AI content:', e);
      return null;
    }
  }

  // Get the current interaction being viewed
  const currentInteraction = interactions.find(i => i.id === selectedInteraction);
  const isViewingLatest = currentInteraction && 
    currentInteraction.id === interactions[interactions.length - 1]?.id;
  // Only require viewing latest for submission - allow research to continue after report gen
  const canSubmitResponse = isViewingLatest;

  // Update selected interaction in textarea
  useEffect(() => {
    if (currentInteraction) {
      setUserInput(currentInteraction.content);
    }
  }, [selectedInteraction, currentInteraction]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userInput.trim() || processing || !canSubmitResponse) return;

    try {
      setProcessing(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      // Insert new user response
      const { error: insertError } = await supabase
        .from('grant_application_deep_research')
        .insert({
          grant_application_id: id,
          content: userInput,
          interaction_type: 'user_response',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      // Wait for the insert to be confirmed
      await new Promise(resolve => setTimeout(resolve, 500));

      // Now send to deep-research endpoint for next AI response
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/deep-research`,
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
        throw new Error(errorData.error?.message || 'Failed to process research');
      }

      setUserInput('');
      await loadInteractions();

    } catch (err) {
      console.error('Error submitting research:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit research');
    } finally {
      setProcessing(false);
    }
  }

  async function handleGenerateReport() {
    try {
      setProcessing(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      // Generate final report
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/deep-research-report`,
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
        throw new Error(errorData.error?.message || 'Failed to generate report');
      }

      // Refresh the page to show updated status
      navigate(`/dashboard/applications/${id}`);

    } catch (err) {
      console.error('Error generating report:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div className="max-w-4xl mx-auto py-8 px-4 w-full">
            <div className="text-center">
              <div className="animate-pulse mb-4">
                <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
              <div className="mt-6 text-gray-600">
                <p className="text-lg font-medium mb-2">Initializing Deep Research</p>
                <p className="text-sm">Please wait while we analyze your application and generate initial insights. This may take a few moments.</p>
              </div>
              <div className="mt-6">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              </div>
            </div>
          </div>
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

  return (
    <div className="flex flex-col flex-1 overflow-hidden h-[calc(100vh-12rem)]">
      <div className="flex flex-1 overflow-hidden">
        {/* Main Chat Window */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Fixed Response Form */}
          <div className="bg-white h-full">
            <form onSubmit={handleSubmit} className="p-4 max-w-4xl mx-auto h-full flex flex-col">
              <textarea
                value={userInput}
                onChange={(e) => {
                  setUserInput(e.target.value);
                }}
                placeholder={"Edit the content..."}
                className="flex-1 w-full p-4 border rounded font-mono text-sm mb-4"
                disabled={processing || !isViewingLatest}
              />
              <div className="flex justify-between">
                <button
                  type="submit"
                  disabled={processing || !userInput.trim() || !canSubmitResponse}
                  className={`px-4 py-2 rounded text-white ${
                    processing || !userInput.trim() || !canSubmitResponse
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Send
                </button>
                <button
                  type="button"
                  onClick={handleGenerateReport}
                  disabled={processing}
                  className={`px-4 py-2 rounded text-white ${
                    processing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  Generate Report
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Version History Sidebar */}
        <div className="w-64 border-l bg-gray-50 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">History</h3>
            <div className="space-y-2">
              {[...interactions].reverse().map((interaction) => (
                <button
                  key={interaction.id}
                  onClick={() => setSelectedInteraction(interaction.id)}
                  className={`w-full text-left p-2 rounded text-sm ${
                    selectedInteraction === interaction.id
                      ? 'bg-blue-100'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium capitalize">
                    {interaction.interaction_type.replace(/_/g, ' ')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(interaction.created_at).toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 