/**
 * ConnectionManager
 * 
 * Manages lazy connections to the Supabase realtime API.
 * Provides connection status monitoring and controls the lifecycle of realtime connections.
 */

import { supabase } from './supabase';

type ConnectionListener = (status: boolean) => void;

class ConnectionManager {
  private static instance: ConnectionManager;
  private isOnline: boolean = navigator.onLine;
  private listeners: ConnectionListener[] = [];
  private activeConnections: Set<string> = new Set();
  private isReconnecting: boolean = false;
  private pingInterval: number | null = null;
  
  /**
   * Get the singleton instance of ConnectionManager
   */
  static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }
  
  /**
   * Initialize the connection manager
   * Sets up event listeners for online/offline events
   */
  constructor() {
    if (typeof window !== 'undefined') {
      // Monitor browser online/offline events
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
      
      // Set up periodic connection checking
      this.startPeriodicChecks();
    }
  }
  
  /**
   * Start a subscription to a Supabase channel
   * Only connects if no active channels exist
   */
  startSubscription(channelName: string): void {
    this.activeConnections.add(channelName);
    
    // Ensure connection is established if this is the first channel
    if (this.activeConnections.size === 1) {
      this.connectRealtime();
    }
  }
  
  /**
   * End a subscription to a Supabase channel
   * Disconnects if no active channels remain
   */
  endSubscription(channelName: string): void {
    this.activeConnections.delete(channelName);
    
    // If no more active connections, disconnect
    if (this.activeConnections.size === 0) {
      this.disconnectRealtime();
    }
  }
  
  /**
   * Connect to the Supabase realtime API
   */
  private async connectRealtime(): Promise<void> {
    if (!supabase.realtime.isConnected()) {
      try {
        await supabase.realtime.connect();
        console.log('Realtime connection established');
        this.notifyListeners(true);
      } catch (error) {
        console.error('Error connecting to realtime:', error);
        this.notifyListeners(false);
      }
    }
  }
  
  /**
   * Disconnect from the Supabase realtime API
   */
  private async disconnectRealtime(): Promise<void> {
    if (supabase.realtime.isConnected()) {
      try {
        await supabase.realtime.disconnect();
        console.log('Realtime connection closed');
      } catch (error) {
        console.error('Error disconnecting from realtime:', error);
      }
    }
  }
  
  /**
   * Reconnect to Supabase realtime
   * Used when connection is lost or when returning to the app
   */
  async reconnect(): Promise<void> {
    if (this.isReconnecting || this.activeConnections.size === 0) return;
    
    try {
      this.isReconnecting = true;
      
      await this.disconnectRealtime();
      await this.connectRealtime();
      
      // Re-authenticate if needed
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.auth.refreshSession();
      }
      
      this.notifyListeners(true);
      console.log('Supabase connection reestablished');
    } catch (error) {
      console.error('Error reconnecting to Supabase:', error);
      this.notifyListeners(false);
    } finally {
      this.isReconnecting = false;
    }
  }
  
  /**
   * Handle browser online event
   */
  private handleOnline = (): void => {
    this.isOnline = true;
    if (this.activeConnections.size > 0) {
      this.reconnect();
    }
  }
  
  /**
   * Handle browser offline event
   */
  private handleOffline = (): void => {
    this.isOnline = false;
    this.notifyListeners(false);
  }
  
  /**
   * Start periodic connection checks
   */
  private startPeriodicChecks(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    
    // Check connection every 60 seconds if there are active connections
    this.pingInterval = window.setInterval(() => {
      if (this.activeConnections.size > 0 && navigator.onLine) {
        this.pingConnection();
      }
    }, 60000);
  }
  
  /**
   * Ping Supabase to check connection status
   */
  private async pingConnection(): Promise<void> {
    try {
      // Make a lightweight query to check connection using grant_applications table
      const { error } = await supabase.from('grant_applications').select('count').limit(1).maybeSingle();
      
      if (error) {
        console.warn('Connection check failed, attempting to reconnect');
        this.notifyListeners(false);
        this.reconnect();
      } else if (!this.isOnline) {
        this.notifyListeners(true);
      }
    } catch (err) {
      console.error('Error checking connection:', err);
      this.notifyListeners(false);
    }
  }
  
  /**
   * Add a listener for connection status changes
   */
  addListener(listener: ConnectionListener): () => void {
    this.listeners.push(listener);
    // Immediately notify with current status
    listener(this.isOnline && supabase.realtime.isConnected());
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  /**
   * Notify all listeners of a connection status change
   */
  private notifyListeners(status: boolean): void {
    this.listeners.forEach(listener => listener(status));
  }
  
  /**
   * Get current connection status
   */
  getStatus(): boolean {
    return this.isOnline && supabase.realtime.isConnected();
  }
}

// Create and export the singleton instance
export const connectionManager = ConnectionManager.getInstance();

// Hook for components to use connection manager
export function useConnection() {
  const [isConnected, setIsConnected] = useState(connectionManager.getStatus());
  
  useEffect(() => {
    // Subscribe to connection status changes
    const unsubscribe = connectionManager.addListener(setIsConnected);
    return unsubscribe;
  }, []);
  
  return {
    isConnected,
    reconnect: () => connectionManager.reconnect()
  };
}

// Need to import React hooks for useConnection
import { useState, useEffect } from 'react'; 