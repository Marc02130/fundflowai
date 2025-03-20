import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '~/lib/supabase';

interface ResearchInteraction {
  id: string;
  interaction_type: 'ai_output' | 'user_response' | 'ai_response';
  content: any;
  created_at: string;
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
  const [userInput, setUserInput] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setSectionName('Deep Research');
    return () => setSectionName(null);
  }, [setSectionName]);

  useEffect(() => {
    loadInteractions();
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
      setInteractions(data || []);
    } catch (err) {
      console.error('Error loading interactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load research interactions');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userInput.trim() || processing) return;

    try {
      setProcessing(true);
      
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Send user input to deep-research endpoint
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
            user_input: userInput
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to process research');
      }

      // Clear input and reload interactions
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
      
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Generate final report
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
            generate_report: true
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate report');
      }

      // Navigate back to application view
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

  return (
    <div className="flex flex-col h-screen">
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Chat Window */}
        <div className="flex-1 flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {interactions.map((interaction) => (
              <div
                key={interaction.id}
                id={interaction.id}
                className={`p-4 rounded-lg ${
                  interaction.interaction_type === 'user_response'
                    ? 'bg-blue-100 ml-8'
                    : 'bg-gray-100 mr-8'
                }`}
              >
                <div className="text-sm text-gray-500 mb-1">
                  {new Date(interaction.created_at).toLocaleString()}
                </div>
                <div className="whitespace-pre-wrap">{interaction.content.text}</div>
              </div>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
            <div className="space-y-4">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your response..."
                className="w-full p-2 border rounded h-24 resize-y"
                disabled={processing}
              />
              <div className="flex justify-between">
                <button
                  type="submit"
                  disabled={processing || !userInput.trim()}
                  className={`px-4 py-2 rounded text-white ${
                    processing || !userInput.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Send
                </button>
                <button
                  type="button"
                  onClick={handleGenerateReport}
                  disabled={processing || interactions.length === 0}
                  className={`px-4 py-2 rounded text-white ${
                    processing || interactions.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  Generate Report
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Version History Sidebar */}
        <div className="w-64 border-l bg-gray-50 overflow-y-auto p-4">
          <h3 className="font-semibold mb-4">Version History</h3>
          <div className="space-y-2">
            {interactions.slice().reverse().slice(0, 10).map((interaction) => (
              <button
                key={interaction.id}
                className="w-full text-left p-2 hover:bg-gray-200 rounded text-sm"
                onClick={() => {
                  document.getElementById(interaction.id)?.scrollIntoView({
                    behavior: 'smooth'
                  });
                }}
              >
                <div className="font-medium">
                  {interaction.interaction_type === 'user_response' ? 'You' : 'AI'}
                </div>
                <div className="text-gray-500 text-xs">
                  {new Date(interaction.created_at).toLocaleString()}
                </div>
              </button>
            ))}
            {interactions.length > 10 && (
              <button
                className="w-full text-center text-blue-600 hover:text-blue-800 text-sm"
                onClick={() => {
                  // Implement load more logic
                }}
              >
                Load More
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 