/**
 * ConnectionStatus component
 * Displays current connection status and allows manual reconnection
 */

import { useConnection } from '~/lib/connectionManager';

export default function ConnectionStatus() {
  const { isConnected, reconnect } = useConnection();
  
  // Only show when disconnected
  if (isConnected) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-amber-50 text-amber-800 shadow-md rounded-md p-2 flex items-center gap-2 text-sm border border-amber-200">
      <div className="h-2 w-2 rounded-full bg-amber-500"></div>
      <span>Offline</span>
      <button 
        onClick={reconnect}
        className="ml-2 px-2 py-0.5 bg-amber-100 hover:bg-amber-200 rounded-sm text-xs"
      >
        Reconnect
      </button>
    </div>
  );
} 