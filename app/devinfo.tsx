import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStorage } from '@/hooks/useStorage';
import { exportData } from '../utils/storage';
import * as Clipboard from 'expo-clipboard';

const DevInfo = () => {
  const { loadData } = useStorage();
  
  const handleExportData = async () => {
    try {
      const exportedData = await exportData();
      await Clipboard.setStringAsync(exportedData);
      alert('Data exported and copied to clipboard');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
    }
  };
  
  const handleContactDeveloper = () => {
    Linking.openURL('mailto:musaddiq@iut-dhaka.edu?subject=WhatTheFi%20App%20Feedback');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 pt-20">
        <Text className="font-rubik-bold text-3xl mx-4 mb-2">Developer Info</Text>
        <Text className="font-rubik text-black-200 mx-4 mb-6">About this app and developer</Text>
        
        <View className="bg-accent-100 mx-4 p-4 rounded-xl mb-6">
          <Text className="font-rubik-medium text-primary-300 text-lg mb-2">WhatTheFi? v1.0.0</Text>
          <Text className="font-rubik text-black-200 mb-3">
            A simple WiFi usage tracking app for monitoring data consumption in IUT Halls.
          </Text>
          <Text className="font-rubik text-black-200">
            Built with React Native, Expo, and NativeWind.
          </Text>
        </View>
        
        <View className="mx-4 mb-6">
          <Text className="font-rubik-medium text-lg mb-4">Suggestions, bugs or feedback ? </Text>
{/*           
          <TouchableOpacity 
            className="bg-primary-300/10 p-4 rounded-lg mb-3 flex-row items-center"
            onPress={handleExportData}
          >
            <View className="w-8 h-8 rounded-full bg-primary-300 items-center justify-center mr-3">
              <Text className="text-white font-rubik-bold">↑</Text>
            </View>
            <View>
              <Text className="font-rubik-medium">Export App Data</Text>
              <Text className="font-rubik text-xs text-black-200">Copy data to clipboard</Text>
            </View>
          </TouchableOpacity> */}
          
          <TouchableOpacity 
            className="bg-primary-300/10 p-4 rounded-lg mb-3 flex-row items-center"
            onPress={handleContactDeveloper}
          >
            <View className="w-8 h-8 rounded-full bg-primary-300 items-center justify-center mr-3">
              <Text className="text-white font-rubik-bold">✉️</Text>
            </View>
            <View>
              <Text className="font-rubik-medium">Contact Developer</Text>
              <Text className="font-rubik text-xs text-black-200">Send feedback or report issues</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <View className="mx-4 mb-12">
          <Text className="font-rubik-medium text-lg mb-4">About Developer</Text>
          
          <View className="bg-accent-100 p-4 rounded-xl">
            <Text className="font-rubik-medium mb-1 text-primary-300">Musaddiq Rafi</Text>
            <Text className="font-rubik text-black-200 ">
              220042135 , Software Engineering 
            </Text>
            <Text className="font-rubik text-black-200 mb-3">
              Department of Computer Science and Engineering
            </Text>
            
            <Text className="font-rubik text-xs text-black-100 mt-4 text-center">
              Copyright © 2025 • All Rights Reserved
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DevInfo;