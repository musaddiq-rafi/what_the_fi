import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import WifiTile from '@/components/wifi/WiFiTile';
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
  lastScraped?: number;
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
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function Index() {
  const router = useRouter();
  const [lastNotificationTime, setLastNotificationTime] = useState<number>(0);
  
  // Sample connections data (in a real app, this would come from API or storage)
  const [connections, setConnections] = useState<WiFiConnection[]>([
    {
      id: '1',
      name: 'IUT WiFi',
      username: 'student123',
      password: '********',
      usedMinutes: 10592,
      totalMinutes: 12000,
      isActive: true,
      lastUpdated: Date.now(),
      lastScraped: Date.now() - 3600000 // 1 hour ago
    },
    {
      id: '2',
      name: 'Home WiFi',
      username: 'homeuser',
      password: '********',
      usedMinutes: 5430,
      totalMinutes: 10000,
      isActive: false
    }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isScrapingLoading, setIsScrapingLoading] = useState(false);
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

  // Find active connection
  const activeConnection = connections.find(conn => conn.isActive);
  
  // Handle activation of a WiFi connection
  const handleActivate = (id: string) => {
    // Update connections with the newly activated one
    const updatedConnections = connections.map(conn => ({
      ...conn,
      isActive: conn.id === id,
      lastUpdated: conn.id === id ? Date.now() : conn.lastUpdated
    }));

    setConnections(updatedConnections);
    
    // Send notification if permissions granted
    if (notificationPermission) {
      const activatedConn = connections.find(conn => conn.id === id);
      if (activatedConn) {
        Notifications.scheduleNotificationAsync({
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
  const handleStopTracking = () => {
    if (activeConnection && notificationPermission) {
      // Send notification when tracking stops
      Notifications.scheduleNotificationAsync({
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
  };

  // Check for threshold limits and notify user
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
      }
    };
    
    checkThresholds();
  }, [activeConnection?.usedMinutes, thresholdValue, lastNotificationTime, notificationPermission]);

  // Manual data scraping function - just a placeholder for now
  const handleManualUpdate = async () => {
    if (!activeConnection) {
      Alert.alert("No Active Connection", "Please activate a WiFi connection first.");
      return;
    }
    
    try {
      setIsScrapingLoading(true);
      
      // Simulate an API call or scraping operation
      setTimeout(() => {
        // Update with mock data
        const updatedConnections = connections.map(conn => 
          conn.isActive ? {
            ...conn,
            usedMinutes: 10592, // Mock data
            totalMinutes: 12000,
            lastUpdated: Date.now(),
            lastScraped: Date.now()
          } : conn
        );
        
        setConnections(updatedConnections);
        Alert.alert("Success", "WiFi data updated successfully!");
        setIsScrapingLoading(false);
      }, 1500);
      
    } catch (error) {
      Alert.alert("Update Failed", 
        `Could not update WiFi data: ${error instanceof Error ? error.message : String(error)}`);
      setIsScrapingLoading(false);
    }
  };

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

  // Create a custom ActiveWifi component that includes the update button
  const ActiveWifiWithUpdate = ({ connection }: { connection: WiFiConnection }) => {
    return (
      <View className="bg-white rounded-xl border border-primary-200 p-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="font-rubik-semibold text-lg">{connection.name}</Text>
          <TouchableOpacity onPress={() => handleEditWifi(connection.id)}>
            <Image source={icons.edit} className="size-5" />
          </TouchableOpacity>
        </View>
        
        <Text className="font-rubik text-sm text-black-200 mb-4">
          {connection.username}
        </Text>
        
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="font-rubik">Usage</Text>
            <Text className="font-rubik">
              {connection.usedMinutes} / {connection.totalMinutes} minutes
            </Text>
          </View>
          
          <View className="h-2 w-full bg-gray-200 rounded-full">
            <View 
              className={`h-full rounded-full ${
                connection.usedMinutes > thresholdValue ? 'bg-red-500' : 'bg-primary-300'
              }`}
              style={{ width: `${Math.min(100, (connection.usedMinutes / connection.totalMinutes) * 100)}%` }}
            />
          </View>
        </View>
        
        <View className="flex-row justify-between items-center mb-3">
          <Text className="font-rubik text-xs text-black-200">
            {connection.lastScraped 
              ? `Last updated: ${new Date(connection.lastScraped).toLocaleTimeString()}`
              : 'Not updated yet'}
          </Text>
          <Text className="font-rubik text-xs text-black-200">
            Resets on day {resetDay} of the month
          </Text>
        </View>
        
        <View className="flex-row justify-between">
          <TouchableOpacity 
            className="bg-red-500 py-2 px-4 rounded-lg"
            onPress={handleStopTracking}
          >
            <Text className="font-rubik-medium text-white">Stop Tracking</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`py-2 px-4 rounded-lg ${isScrapingLoading ? 'bg-primary-100' : 'bg-primary-300'}`}
            onPress={handleManualUpdate}
            disabled={isScrapingLoading}
          >
            {isScrapingLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="font-rubik-medium text-white">Update Data</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
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
        
        {/* Active Connection with Update Button */}
        {activeConnection ? (
          <View className="mx-4 mb-4">
            <ActiveWifiWithUpdate connection={activeConnection} />
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
        
        {/* Footer with info */}
        <View className="py-4 items-center mb-2">
          <Text className="font-rubik text-gray-400 text-xs mt-1">
            Manual mode - data only updates when you refresh
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}