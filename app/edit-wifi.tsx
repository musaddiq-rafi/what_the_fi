import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useStorage } from '@/hooks/useStorage';
import icons from '@/constants/icons';

export default function EditWifi() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { loadData, saveData } = useStorage();
  
  const [wifiDetails, setWifiDetails] = useState({
    name: '',
    id: id || '',
    totalMinutes: 12000,
    usedMinutes: 0,
    isActive: false
  });

  // Load connections data
  useEffect(() => {
    const loadWifiData = async () => {
      const connections = await loadData('connections');
      if (connections) {
        const connection = connections.find((c: any) => c.id === id);
        if (connection) {
          setWifiDetails(connection);
        } else if (id === 'wifi4') {
          // This is the "Add New" tile
          setWifiDetails({
            name: 'New Connection',
            id: `wifi-${Date.now()}`, // Generate unique ID
            totalMinutes: 12000,
            usedMinutes: 0,
            isActive: false
          });
        }
      }
    };
    
    loadWifiData();
  }, [id]);
  
  const handleSave = async () => {
    const connections = await loadData('connections') || [];
    
    if (id === 'wifi4') {
      // Adding a new connection
      await saveData('connections', [...connections, wifiDetails]);
    } else {
      // Updating existing connection
      const updatedConnections = connections.map((conn: any) => 
        conn.id === id ? wifiDetails : conn
      );
      await saveData('connections', updatedConnections);
    }
    
    router.back();
  };
  
  const handleReset = async () => {
    setWifiDetails(prev => ({
      ...prev,
      usedMinutes: 0
    }));
    
    // Save immediately
    const connections = await loadData('connections') || [];
    const updatedConnections = connections.map((conn: any) => 
      conn.id === id ? {...conn, usedMinutes: 0} : conn
    );
    await saveData('connections', updatedConnections);
  };
  
  return (
    <ScrollView className="flex-1 bg-white pt-12">
      <Stack.Screen options={{ headerShown: false }} />
      
      <View className="flex-row items-center px-4 mb-6">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Image source={icons.backArrow} className="size-6" />
        </TouchableOpacity>
        <Text className="font-rubik-semibold text-xl">
          {id === 'wifi4' ? 'Add New WiFi' : 'Edit WiFi'}
        </Text>
      </View>
      
      <View className="px-4">
        <View className="mb-4">
          <Text className="font-rubik-medium text-sm mb-1">WiFi Name</Text>
          <TextInput
            value={wifiDetails.name}
            onChangeText={(text) => setWifiDetails(prev => ({ ...prev, name: text }))}
            className="border border-primary-200 rounded-lg p-3 font-rubik"
            placeholder="Enter WiFi name"
          />
        </View>
        
        <View className="mb-6">
          <Text className="font-rubik-medium text-sm mb-1">Total Minutes</Text>
          <TextInput
            value={wifiDetails.totalMinutes.toString()}
            onChangeText={(text) => {
              const value = parseInt(text) || 0;
              setWifiDetails(prev => ({ ...prev, totalMinutes: value }));
            }}
            keyboardType="numeric"
            className="border border-primary-200 rounded-lg p-3 font-rubik"
            placeholder="Enter total minutes"
          />
          <Text className="font-rubik text-xs text-black-200 mt-1">
            Default is 12000 minutes (200 hours)
          </Text>
        </View>
        
        <TouchableOpacity 
          onPress={handleSave}
          className="bg-primary-300 py-3 rounded-lg"
        >
          <Text className="text-white text-center font-rubik-medium">Save Changes</Text>
        </TouchableOpacity>
        
        {id !== 'wifi4' && (
          <TouchableOpacity 
            onPress={handleReset}
            className="mt-4 py-3 rounded-lg border border-danger"
          >
            <Text className="text-danger text-center font-rubik-medium">Reset Counter</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}