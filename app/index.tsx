import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, SafeAreaView, Image, TouchableOpacity, AppState, AppStateStatus } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import WifiTile from '@/components/wifi/WiFiTile';
import ActiveWifi from '@/components/wifi/ActiveWifi';
import { useStorage } from '@/hooks/useStorage';
import { checkResetDate } from '@/utils/dateUtils';
import icons from '@/constants/icons';
import * as Notifications from 'expo-notifications';

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

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function Index() {
  const { loadData, saveData } = useStorage();
  const router = useRouter();
  
  const [connections, setConnections] = useState<WiFiConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appState, setAppState] = useState(AppState.currentState);
  const [notificationPermission, setNotificationPermission] = useState(false);

  // Request notification permissions
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      setNotificationPermission(status === 'granted');
    };

    requestPermissions();
  }, []);

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
    }, [])
  );
  
  // Save data to storage when connections change
  useEffect(() => {
    if (!isLoading) {
      saveData('connections', connections);
    }
  }, [connections, isLoading]);

  // Track app state (foreground, background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [connections]);

  // Handle app state changes to save/restore active connection
  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (appState === 'active' && nextAppState.match(/inactive|background/)) {
      // App is going to background or inactive, save connections state
      await saveData('connections', connections);
    }
    setAppState(nextAppState);
  };
  
  // Find active connection
  const activeConnection = connections.find(conn => conn.isActive);
  
  // Handle activation of a WiFi connection
  const handleActivate = async (id: string) => {
    // Update connections with the newly activated one
    const updatedConnections = connections.map(conn => ({
      ...conn,
      isActive: conn.id === id,
      lastUpdated: conn.id === id ? Date.now() : conn.lastUpdated
    }));

    setConnections(updatedConnections);
    
    // Immediately save to AsyncStorage to persist active state
    await saveData('connections', updatedConnections);
    
    // Send notification if permissions granted
    if (notificationPermission) {
      const activatedConn = connections.find(conn => conn.id === id);
      if (activatedConn) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "WiFi Tracking Started",
            body: `Now tracking usage for ${activatedConn.name}`,
            data: { id: activatedConn.id },
          },
          trigger: null, // Send immediately
        });
      }
    }
  };
  
  // Handle stopping an active connection
  const handleStopTracking = async () => {
    if (activeConnection && notificationPermission) {
      // Send notification when tracking stops
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "WiFi Tracking Stopped",
          body: `Stopped tracking ${activeConnection.name}. Used: ${activeConnection.usedMinutes} minutes`,
          data: { id: activeConnection.id },
        },
        trigger: null, // Send immediately
      });
    }

    const updatedConnections = connections.map(conn => ({
      ...conn,
      isActive: false
    }));
    
    setConnections(updatedConnections);
    
    // Immediately save to AsyncStorage
    await saveData('connections', updatedConnections);
  };

  // Check for threshold limits and notify user
  useEffect(() => {
    // Function to check limits and send notification
    const checkThresholds = async () => {
      if (!activeConnection || !notificationPermission) return;
      
      // Get threshold from settings or use default
      const thresholdValue = await loadData('thresholdValue') || 10500;
      
      // If usage exceeds threshold, send notification
      if (activeConnection.usedMinutes > thresholdValue && 
          activeConnection.usedMinutes <= thresholdValue + 5) { // +5 to avoid multiple notifications
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "WiFi Usage Alert!",
            body: `Your ${activeConnection.name} usage has exceeded ${thresholdValue} minutes`,
            data: { id: activeConnection.id },
          },
          trigger: null, // Send immediately
        });
      }
    };
    
    checkThresholds();
  }, [activeConnection?.usedMinutes]);

  // Simulate counter increment for active connection
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeConnection) {
      interval = setInterval(async () => {
        // Add a minute and update last updated timestamp
        const updatedConnections = connections.map(conn => 
          conn.isActive ? { 
            ...conn, 
            usedMinutes: Math.min(conn.usedMinutes + 1, conn.totalMinutes),
            lastUpdated: Date.now()
          } : conn
        );
        
        setConnections(updatedConnections);
        
        // Save updated usage to AsyncStorage periodically
        await saveData('connections', updatedConnections);
      }, 60000); // Update every minute
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
      <ScrollView className="flex-1 pt-20">
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
          <Text className="font-rubik text-gray-400 text-xs mt-1"> </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}