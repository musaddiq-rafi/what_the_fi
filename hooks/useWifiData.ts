import { useState, useEffect } from 'react';
import { useStorage } from './useStorage';
import { checkResetDate } from '@/utils/dateUtils';

export interface WiFiConnection {
  id: string;
  name: string;
  usedMinutes: number;
  totalMinutes: number;
  isActive: boolean;
  lastUpdated?: number;
}

export const DEFAULT_CONNECTIONS: WiFiConnection[] = [
  { id: 'wifi1', name: 'Home WiFi', usedMinutes: 0, totalMinutes: 12000, isActive: false },
  { id: 'wifi2', name: 'Office WiFi', usedMinutes: 0, totalMinutes: 12000, isActive: false },
  { id: 'wifi3', name: 'Mobile Hotspot', usedMinutes: 0, totalMinutes: 12000, isActive: false },
];

export const useWifiData = () => {
  const { loadData, saveData } = useStorage();
  const [connections, setConnections] = useState<WiFiConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        // Load connections from storage
        const storedConnections = await loadData('connections');
        
        if (storedConnections && storedConnections.length > 0) {
          setConnections(storedConnections);
        } else {
          // First time - set default connections
          setConnections(DEFAULT_CONNECTIONS);
          await saveData('connections', DEFAULT_CONNECTIONS);
        }
        
        // Check if reset is needed
        const resetDay = await loadData('resetDay') || 21;
        const shouldReset = checkResetDate(resetDay);
        
        if (shouldReset) {
          // Reset all counters
          const resetConnections = connections.map(conn => ({
            ...conn,
            usedMinutes: 0
          }));
          setConnections(resetConnections);
          await saveData('connections', resetConnections);
          await saveData('lastResetDate', new Date().toISOString());
        }
      } catch (error) {
        console.error('Error initializing WiFi data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeData();
  }, []);
  
  // Save changes when connections update
  useEffect(() => {
    if (!isLoading && connections.length > 0) {
      saveData('connections', connections);
    }
  }, [connections]);
  
  // Get active connection
  const activeConnection = connections.find(conn => conn.isActive);
  
  // Activate/start tracking a connection
  const activateConnection = (id: string) => {
    setConnections(prev => prev.map(conn => ({
      ...conn,
      isActive: conn.id === id,
      lastUpdated: conn.id === id ? Date.now() : conn.lastUpdated
    })));
  };
  
  // Stop tracking the active connection
  const stopTracking = () => {
    setConnections(prev => prev.map(conn => ({
      ...conn,
      isActive: false
    })));
  };
  
  // Add minutes to active connection
  const addMinutes = (minutes: number) => {
    if (activeConnection) {
      setConnections(prev => prev.map(conn => 
        conn.isActive ? { 
          ...conn, 
          usedMinutes: Math.min(conn.usedMinutes + minutes, conn.totalMinutes)
        } : conn
      ));
    }
  };
  
  // Reset a specific connection
  const resetConnection = (id: string) => {
    setConnections(prev => prev.map(conn => 
      conn.id === id ? { ...conn, usedMinutes: 0 } : conn
    ));
  };
  
  // Add a new connection
  const addConnection = (connection: Omit<WiFiConnection, 'id'>) => {
    const newConnection = {
      ...connection,
      id: `wifi-${Date.now()}`,
      isActive: false
    };
    setConnections(prev => [...prev, newConnection]);
  };
  
  // Update a connection
  const updateConnection = (id: string, connection: Partial<WiFiConnection>) => {
    setConnections(prev => prev.map(conn => 
      conn.id === id ? { ...conn, ...connection } : conn
    ));
  };
  
  // Delete a connection
  const deleteConnection = (id: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== id));
  };
  
  // Reset all connections
  const resetAllConnections = () => {
    setConnections(prev => prev.map(conn => ({ ...conn, usedMinutes: 0 })));
  };
  
  return {
    connections,
    activeConnection,
    isLoading,
    activateConnection,
    stopTracking,
    addMinutes,
    resetConnection,
    addConnection,
    updateConnection,
    deleteConnection,
    resetAllConnections
  };
};