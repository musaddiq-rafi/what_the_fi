import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import WifiTile from '@/components/wifi/WiFiTile';
import ActiveWifi from '@/components/wifi/ActiveWifi';
import { useStorage } from '@/hooks/useStorage';
import { checkResetDate } from '@/utils/dateUtils';
import icons from '@/constants/icons';

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
  const router = useRouter();
  
  // Initial data
  const [connections, setConnections] = useState<WiFiConnection[]>([
    { id: 'wifi1', name: 'Home WiFi', usedMinutes: 8500, totalMinutes: 12000, isActive: false },
    { id: 'wifi2', name: 'Office WiFi', usedMinutes: 3200, totalMinutes: 12000, isActive: false },
    { id: 'wifi3', name: 'Mobile Hotspot', usedMinutes: 11000, totalMinutes: 12000, isActive: false },
    { id: 'wifi4', name: 'Add New', usedMinutes: 0, totalMinutes: 12000, isActive: false },
  ]);
  
  const [isLoading, setIsLoading] = useState(true);

  // Load data from storage on mount
  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      const storedConnections = await loadData('connections');
      if (storedConnections && storedConnections.length > 0) {
        setConnections(storedConnections);
      }
      // Get reset day and check if reset is needed
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
      
      setIsLoading(false);
    };
    
    getData();
  }, []);

  // Save data to storage when connections change
  useEffect(() => {
    if (!isLoading) {
      saveData('connections', connections);
    }
  }, [connections, isLoading]);
  
  // Find active connection
  const activeConnection = connections.find(conn => conn.isActive);
  
  // Handle activation of a WiFi connection
  const handleActivate = (id: string) => {
    setConnections(prev => prev.map(conn => ({
      ...conn,
      isActive: conn.id === id,
      lastUpdated: conn.id === id ? Date.now() : conn.lastUpdated
    })));
  };
  
  // Handle stopping an active connection
  const handleStopTracking = () => {
    setConnections(prev => prev.map(conn => ({
      ...conn,
      isActive: false
    })));
  };

  // Simulate counter increment for active connection
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeConnection) {
      interval = setInterval(() => {
        setConnections(prev => prev.map(conn => 
          conn.isActive ? { 
            ...conn, 
            usedMinutes: Math.min(conn.usedMinutes + 1, conn.totalMinutes),
            lastUpdated: Date.now()
          } : conn
        ));
      }, 60000); // Update every minute (in real app)
      // For demo purposes, you might want to use 3000 (3 seconds) instead of 60000
    }
    
    return () => clearInterval(interval);
  }, [activeConnection?.id]);

  const handleAddNew = () => {
    router.push({
      pathname: '/edit-wifi',
      params: { id: 'wifi4' }
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 pt-12">
        <View className="flex-row justify-between items-center mx-4 mb-2">
          <Text className="font-rubik-bold text-3xl">WhatTheFi?</Text>
          <TouchableOpacity onPress={() => router.push('/appsettings')}>
            <Image source={icons.settings} className="size-7" />
          </TouchableOpacity>
        </View>
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
          <View className="flex-row justify-between items-center mx-4 mb-2">
            <Text className="font-rubik-semibold text-lg">Your WiFi Connections</Text>
            <TouchableOpacity onPress={handleAddNew}>
              <Text className="font-rubik text-primary-300">+ Add New</Text>
            </TouchableOpacity>
          </View>
          
          {connections
            .filter(conn => conn.id !== 'wifi4' && !conn.isActive)
            .map(conn => (
              <View key={conn.id} className="mx-4 mb-3">
                <WifiTile
                  id={conn.id}
                  name={conn.name}
                  usedMinutes={conn.usedMinutes}
                  totalMinutes={conn.totalMinutes}
                  isActive={conn.isActive}
                  onActivate={() => handleActivate(conn.id)}
                />
              </View>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}