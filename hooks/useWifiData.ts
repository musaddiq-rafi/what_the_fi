import { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
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
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  // Sync with background changes
  const syncWithBackgroundChanges = async () => {
    try {
      const storedConnections = await loadData('connections');
      if (storedConnections) {
        const activeConnection = storedConnections.find((conn: { isActive: any; }) => conn.isActive);
        if (activeConnection) {
          const currentTime = Date.now();
          const lastUpdated = activeConnection.lastUpdated || currentTime;
          const minutesElapsed = Math.floor((currentTime - lastUpdated) / 60000);

          if (minutesElapsed > 0) {
            const updatedConnections = storedConnections.map((conn: { isActive: any; usedMinutes: number; totalMinutes: number; }) =>
              conn.isActive ? {
                ...conn,
                usedMinutes: Math.min(conn.usedMinutes + minutesElapsed, conn.totalMinutes),
                lastUpdated: currentTime
              } : conn
            );
            setConnections(updatedConnections);
            await saveData('connections', updatedConnections);
          }
        }
      }
    } catch (error) {
      console.error('Error syncing background changes:', error);
    }
  };

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        const storedConnections = await loadData('connections');
        const resetDay = await loadData('resetDay') || 21;
        const shouldReset = checkResetDate(resetDay);

        if (storedConnections && storedConnections.length > 0) {
          if (shouldReset) {
            const resetConnections = storedConnections.map((conn: any) => ({
              ...conn,
              usedMinutes: 0
            }));
            setConnections(resetConnections);
            await saveData('connections', resetConnections);
            await saveData('lastResetDate', new Date().toISOString());
          } else {
            setConnections(storedConnections);
          }
        } else {
          setConnections(DEFAULT_CONNECTIONS);
          await saveData('connections', DEFAULT_CONNECTIONS);
        }
      } catch (error) {
        console.error('Error initializing WiFi data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        await syncWithBackgroundChanges();
      }
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [appState]);

  // Save connections when updated
  useEffect(() => {
    const saveConnections = async () => {
      if (!isLoading && connections.length > 0) {
        try {
          await saveData('connections', connections);
        } catch (error) {
          console.error('Error saving connections:', error);
        }
      }
    };

    saveConnections();
  }, [connections, isLoading]);

  // Core functions
  const activateConnection = (id: string) => {
    setConnections(prev => prev.map(conn => ({
      ...conn,
      isActive: conn.id === id,
      lastUpdated: conn.id === id ? Date.now() : conn.lastUpdated
    })));
  };

  const stopTracking = () => {
    setConnections(prev => prev.map(conn => ({ ...conn, isActive: false })));
  };

  const addMinutes = (minutes: number) => {
    setConnections(prev =>
      prev.map(conn =>
        conn.isActive
          ? { ...conn, usedMinutes: Math.min(conn.usedMinutes + minutes, conn.totalMinutes) }
          : conn
      )
    );
  };

  const resetConnection = (id: string) => {
    setConnections(prev => prev.map(conn =>
      conn.id === id ? { ...conn, usedMinutes: 0 } : conn
    ));
  };

  const addConnection = (connection: Omit<WiFiConnection, 'id'>) => {
    const newConnection: WiFiConnection = {
      ...connection,
      id: `wifi-${Date.now()}`,
      isActive: false
    };
    setConnections(prev => [...prev, newConnection]);
  };

  const updateConnection = (id: string, connection: Partial<WiFiConnection>) => {
    setConnections(prev => prev.map(conn =>
      conn.id === id ? { ...conn, ...connection } : conn
    ));
  };

  const deleteConnection = (id: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== id));
  };

  const resetAllConnections = () => {
    setConnections(prev => prev.map(conn => ({ ...conn, usedMinutes: 0 })));
  };

  return {
    connections,
    activeConnection: connections.find(conn => conn.isActive),
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
