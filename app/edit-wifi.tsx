import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useStorage } from '@/hooks/useStorage';
import icons from '@/constants/icons';

export default function EditWifi() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { loadData, saveData } = useStorage();
  
  const [showPassword, setShowPassword] = useState(false);
  
  const [wifiDetails, setWifiDetails] = useState({
    name: '',
    id: id !== 'new' ? id : '',
    username: '',
    password: '',
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
        } else if (id === 'new') {
          // This is the "Add New" tile
          setWifiDetails({
            name: '',
            id: '',
            username: '',
            password: '',
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
    // Validate the inputs
    if (!wifiDetails.name.trim()) {
      Alert.alert("Error", "WiFi name cannot be empty");
      return;
    }
    
    if (!wifiDetails.id.trim()) {
      Alert.alert("Error", "ID cannot be empty");
      return;
    }
    
    if (!wifiDetails.username.trim()) {
      Alert.alert("Error", "Username cannot be empty");
      return;
    }
    
    if (!wifiDetails.password.trim()) {
      Alert.alert("Error", "Password cannot be empty");
      return;
    }
    
    const connections = await loadData('connections') || [];
    
    // Check if ID already exists (for new connections only)
    if (id === 'new') {
      const idExists = connections.some((conn: any) => conn.id === wifiDetails.id);
      if (idExists) {
        Alert.alert("Error", "This ID already exists. Please use a different ID.");
        return;
      }
    }
    
    if (id === 'new') {
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
    Alert.alert("Success", "Minutes counter has been reset");
  };
  
  const handleDelete = async () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this WiFi connection?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const connections = await loadData('connections') || [];
            const updatedConnections = connections.filter((conn: any) => conn.id !== id);
            await saveData('connections', updatedConnections);
            router.back();
          }
        }
      ]
    );
  };
  
  return (
    <ScrollView className="flex-1 bg-white pt-20">
      <Stack.Screen options={{ headerShown: false }} />
      
      <View className="flex-row items-center px-4 mb-6">
      <TouchableOpacity onPress={() => router.back()} className="mr-3">
        <Image source={icons.backArrow} className="size-6" />
      </TouchableOpacity>
      <Text className="font-rubik-semibold text-xl">
        {id === 'new' ? 'Add New WiFi' : 'Edit WiFi'}
      </Text>
      </View>
      
      <View className="px-4 mb-16">
      {/* WiFi Name field */}
      <View className="mb-4">
        <Text className="font-rubik-medium text-sm mb-1">Name</Text>
        <TextInput
        value={wifiDetails.name}
        onChangeText={(text) => setWifiDetails(prev => ({ ...prev, name: text }))}
        className="border border-primary-200 rounded-lg p-3 font-rubik"
        placeholder="Enter your name"
        />
      </View>
      
      {/* ID field - editable */}
      <View className="mb-4">
        <Text className="font-rubik-medium text-sm mb-1">ID</Text>
        <TextInput
        value={wifiDetails.id}
        onChangeText={(text) => setWifiDetails(prev => ({ ...prev, id: text }))}
        keyboardType="numeric"
        className="border border-primary-200 rounded-lg p-3 font-rubik"
        placeholder="Enter ID (e.g., 220042135)"
        editable={id === 'new'} // Only editable for new connections
        />
        <Text className="font-rubik text-xs text-black-200 mt-1">
        Numeric ID like 220042135
        </Text>
      </View>
      
      {/* Username field */}
      <View className="mb-4">
        <Text className="font-rubik-medium text-sm mb-1">Username</Text>
        <TextInput
        value={wifiDetails.username}
        onChangeText={(text) => setWifiDetails(prev => ({ ...prev, username: text }))}
        className="border border-primary-200 rounded-lg p-3 font-rubik"
        placeholder="Enter username"
        />
      </View>
      
      {/* Password field with show/hide toggle */}
      <View className="mb-4">
        <Text className="font-rubik-medium text-sm mb-1">Password</Text>
        <View className="relative">
        <TextInput
          value={wifiDetails.password}
          onChangeText={(text) => setWifiDetails(prev => ({ ...prev, password: text }))}
          secureTextEntry={!showPassword}
          className="border border-primary-200 rounded-lg p-3 font-rubik"
          placeholder="Enter password"
        />
        <TouchableOpacity 
          className="absolute right-3 top-3"
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text className="text-primary-300 font-rubik">
          {showPassword ? 'Hide' : 'Show'}
          </Text>
        </TouchableOpacity>
        </View>
      </View>
      
      {/* Used Minutes field */}
      <View className="mb-4">
        <Text className="font-rubik-medium text-sm mb-1">Used Minutes</Text>
        <TextInput
        value={wifiDetails.usedMinutes.toString()}
        onChangeText={(text) => {
          const value = parseInt(text) || 0;
          setWifiDetails(prev => ({ ...prev, usedMinutes: value }));
        }}
        keyboardType="numeric"
        className="border border-primary-200 rounded-lg p-3 font-rubik"
        placeholder="Enter used minutes"
        />
      </View>
      
      {/* Total Minutes field */}
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
      
      {/* Save button */}
      <TouchableOpacity 
        onPress={handleSave}
        className="bg-primary-300 py-3 rounded-lg"
      >
        <Text className="text-white text-center font-rubik-medium">Save Changes</Text>

        
      </TouchableOpacity>
      
      
      {/* Only show Reset and Delete for existing connections */}
      {id !== 'new' && (
        <>
        <TouchableOpacity 
          onPress={handleReset}
          className="mt-4 py-3 rounded-lg border border-primary-200"
        >
          <Text className="text-primary-300 text-center font-rubik-medium">Reset Counter</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleDelete}
          className="mt-4 py-3 rounded-lg border border-danger"
        >
          <Text className="text-danger text-center font-rubik-medium">Delete WiFi Connection</Text>
        </TouchableOpacity>
        
        </>
      )}
      
      {/* Exit App button - shown for both new and existing connections */}
      <TouchableOpacity 
        className="mt-4 py-3 ">
        <Text className="text-warning text-center font-rubik-medium"> </Text> //intentionally left blank
      </TouchableOpacity>
      </View>
    </ScrollView>
  );
}