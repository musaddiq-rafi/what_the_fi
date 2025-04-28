import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import WifiTile from '@/components/wifi/WiFiTile';
import ActiveWifi from '@/components/wifi/ActiveWifi';
import { useStorage } from '@/hooks/useStorage';
import { checkResetDate } from '@/utils/dateUtils';
import icons from '@/constants/icons';

// Define types with enhanced fields
interface WiFiConnection {
  id: string;
  name: string;
  username: string;
  password: string;
  usedMinutes: number;
  totalMinutes: number;
  isActive: boolean;
  lastUpdated?: number;
}

export default function Index() {
  const { loadData, saveData } = useStorage();
  const router = useRouter();
  
  const [connections, setConnections] = useState<WiFiConnection[]>( []);
  
  const [isLoading, setIsLoading] = useState(true);

  // Create a reusable function to load connections data
  const loadConnections = useCallback(async () => {
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
      const resetConnections = storedConnections ? storedConnections.map((conn: WiFiConnection) => ({
        ...conn,
        usedMinutes: 0
      })) : connections.map(conn => ({
        ...conn,
        usedMinutes: 0
      }));
      
      setConnections(resetConnections);
      await saveData('connections', resetConnections);
      await saveData('lastResetDate', new Date().toISOString());
    }
    
    setIsLoading(false);
  }, []);

  // Use useFocusEffect to reload data whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadConnections();
      // No need to include loadConnections in dependencies array as it's already wrapped in useCallback
    }, [])
  );
  
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
      params: { id: 'new' }
    });
  };

  const handleEditWifi = (id: string) => {
    router.push({
      pathname: '/edit-wifi',
      params: { id }
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
              username={activeConnection.username}
              usedMinutes={activeConnection.usedMinutes}
              totalMinutes={activeConnection.totalMinutes}
              onStop={handleStopTracking}
              onEdit={() => handleEditWifi(activeConnection.id)}
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
            .filter(conn => conn.id !== 'new' && !conn.isActive)
            .map(conn => (
              <View key={conn.id} className="mx-4 mb-3">
                <WifiTile
                  id={conn.id}
                  name={conn.name}
                  username={conn.username}
                  usedMinutes={conn.usedMinutes}
                  totalMinutes={conn.totalMinutes}
                  isActive={conn.isActive}
                  onActivate={() => handleActivate(conn.id)}
                  onEdit={() => handleEditWifi(conn.id)}
                />
              </View>
            ))}
        </View>
        
        {/* Footer with creator info */}
        <View className="py-4 items-center mb-2">
        
          <Text className="font-rubik text-gray-400 text-xs mt-1"> </Text> // this part was intentionally left blank
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}