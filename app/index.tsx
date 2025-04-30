import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, SafeAreaView, Image, TouchableOpacity, AppState, AppStateStatus } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import WifiTile from '@/components/wifi/WiFiTile';
import ActiveWifi from '@/components/wifi/ActiveWifi';
import { useStorage } from '@/hooks/useStorage';
import { checkResetDate } from '@/utils/dateUtils';
import icons from '@/constants/icons';
import * as Notifications from 'expo-notifications';
import { registerBackgroundTask } from '@/utils/backgroundTaskHandler';

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

export const getFunnyNotification = (minutes: number, name: string) => {
  const messages = [
    `🚨 ${name} WiFi for ${minutes} minutes? IUT authority just sent a drone to chase your wallet.`,
    `📱 ${name} WiFi for ${minutes} minutes? Even IUT's finance office is impressed by your dedication to bankruptcy.`,
    `🎮 ${minutes} minutes on WiFi? Netflix called, but IUT called first—they want their cut.`,
    `🔥 ${name} WiFi for ${minutes} minutes! Your router is now on IUT's payroll.`,
    `🏃‍♂️ ${name} WiFi says, "Bro, even IUT's semester fees take a break after ${minutes} minutes!"`,
    `🎭 ${minutes} minutes on ${name} WiFi? Your router is filing a complaint with IUT's admin office.`,
    `🌟 ${name} WiFi for ${minutes} minutes? Achievement unlocked: "IUT's Favorite Donor."`,
    `🎪 ${name} WiFi for ${minutes} minutes? Your router just Googled "how to apply for financial aid at IUT."`,
    `🎯 ${minutes} minutes on WiFi? IUT's finance department just added you to their VIP list.`,
    `💀 ${minutes} minutes on ${name} WiFi? Your router is now demanding a semester fee refund from IUT.`
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
};

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
  const [lastNotificationTime, setLastNotificationTime] = useState<number>(0);
  const [connections, setConnections] = useState<WiFiConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appState, setAppState] = useState(AppState.currentState);
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [resetDay, setResetDay] = useState(21);
  const [thresholdValue, setThresholdValue] = useState(10500);

  // Request notification permissions
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      setNotificationPermission(status === 'granted');
    };

    requestPermissions();
  }, []);

  useEffect(() => {
    registerBackgroundTask();
  }, []);

  // Create a reusable function to load connections data
  const loadConnections = useCallback(async () => {
    setIsLoading(true);
    const storedConnections = await loadData('connections');
    if (storedConnections && storedConnections.length > 0) {
      setConnections(storedConnections);
    }
    
    // Load settings
    const savedResetDay = await loadData('resetDay') || 21;
    const savedThreshold = await loadData('thresholdValue') || 10500;
    
    setResetDay(savedResetDay);
    setThresholdValue(savedThreshold);
    
    // Check if reset is needed
    const shouldReset = checkResetDate(savedResetDay);
    
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
 // Modify the threshold check effect
useEffect(() => {
  const checkThresholds = async () => {
    if (!activeConnection || !notificationPermission) return;
    
    const currentTime = Date.now();
    const twoHoursInMs = 2 * 60 * 60 * 1000;
    
    // If usage exceeds threshold and enough time has passed since last notification
    if (activeConnection.usedMinutes > thresholdValue && 
        (currentTime - lastNotificationTime >= twoHoursInMs)) {
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "WiFi Usage Alert!",
          body: getFunnyNotification(activeConnection.usedMinutes, activeConnection.name),
          data: { id: activeConnection.id },
        },
        trigger: null, // Send immediately
      });
      
      // Update last notification time
      setLastNotificationTime(currentTime);
      
      // Save last notification time to storage
      await saveData('lastNotificationTime', currentTime);
    }
  };
  
  checkThresholds();
}, [activeConnection?.usedMinutes, thresholdValue, lastNotificationTime]);

// Load last notification time when the app starts
useEffect(() => {
  const loadLastNotificationTime = async () => {
    const savedTime = await loadData('lastNotificationTime');
    if (savedTime) {
      setLastNotificationTime(savedTime);
    }
  };
  
  loadLastNotificationTime();
}, []);

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
              approachingLimit={thresholdValue}
              resetDay={resetDay}
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