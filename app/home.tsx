import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import WifiTile from '../components/wifi/WiFiTile';
import ActiveWifi from '../components/wifi/ActiveWifi';
import { useStorage } from '../hooks/useStorage';

// Define types
interface WiFiConnection {
  id: string;
  name: string;
  usedMinutes: number;
  totalMinutes: number;
  isActive: boolean;
  lastUpdated?: number;
}

export default function Index() {
  const { loadData, saveData } = useStorage();
  
  // Initial data
  const [connections, setConnections] = useState<WiFiConnection[]>([
    { id: 'wifi1', name: 'Home WiFi', usedMinutes: 8500, totalMinutes: 12000, isActive: false },
    { id: 'wifi2', name: 'Office WiFi', usedMinutes: 3200, totalMinutes: 12000, isActive: false },
    { id: 'wifi3', name: 'Mobile Hotspot', usedMinutes: 11000, totalMinutes: 12000, isActive: false },
    { id: 'wifi4', name: 'Add New', usedMinutes: 0, totalMinutes: 12000, isActive: false },
  ]);

  // Load data from storage on mount
  useEffect(() => {
    const getData = async () => {
      const storedConnections = await loadData('connections');
      if (storedConnections) {
        setConnections(storedConnections);
      }
    };
    getData();
  }, []);

  // Save data to storage when connections change
  useEffect(() => {
    saveData('connections', connections);
  }, [connections]);
  
  // Find active connection
  const activeConnection = connections.find(conn => conn.isActive);
  
  // Handle activation of a WiFi connection
  const handleActivate = (id: string) => {
    setConnections(prev => prev.map(conn => ({
      ...conn,
      isActive: conn.id === id
    })));
  };
  
  // Handle stopping an active connection
  const handleStopTracking = () => {
    if (activeConnection) {
      setConnections(prev => prev.map(conn => ({
        ...conn,
        isActive: false
      })));
    }
  };

  // Simulate counter increment for active connection
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeConnection) {
      interval = setInterval(() => {
        setConnections(prev => prev.map(conn => 
          conn.isActive ? { ...conn, usedMinutes: Math.min(conn.usedMinutes + 1, conn.totalMinutes) } : conn
        ));
      }, 60000); // Update every minute
    }
    
    return () => clearInterval(interval);
  }, [activeConnection?.id]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 pt-12">
        <Text className="font-rubik-bold text-3xl mx-4 mb-2">WhatTheFi?</Text>
        <Text className="font-rubik text-black-200 mx-4 mb-6">Track it, or regret it.</Text>
        
        {/* Active Connection */}
        {activeConnection ? (
          <View className="mx-4 mb-4">
            <ActiveWifi
              id={activeConnection.id}
              name={activeConnection.name}
              usedMinutes={activeConnection.usedMinutes}
              totalMinutes={activeConnection.totalMinutes}
              onStop={handleStopTracking}
            />
          </View>
        ) : (
          <View className="mx-4 mb-4 p-4 bg-accent-100 rounded-xl border border-primary-200">
            <Text className="font-rubik text-black-200 text-center">No active WiFi connection</Text>
            <Text className="font-rubik-medium text-center mt-2">Select a connection below to start tracking</Text>
          </View>
        )}
        
        {/* All WiFi Tiles */}
        <View className="mt-4 mb-24">
          <Text className="font-rubik-semibold text-lg mx-4 mb-2">Your WiFi Connections</Text>
          {connections.map(conn => (
            <View key={conn.id} className="mx-4 mb-3">
              {!conn.isActive && (
                <WifiTile
                  id={conn.id}
                  name={conn.name}
                  usedMinutes={conn.usedMinutes}
                  totalMinutes={conn.totalMinutes}
                  isActive={conn.isActive}
                  onActivate={() => handleActivate(conn.id)}
                />
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}