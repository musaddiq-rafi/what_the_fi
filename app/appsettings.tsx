import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useStorage } from '@/hooks/useStorage';

const AppSettings = () => {
  const { loadData, saveData } = useStorage();
  const [resetDay, setResetDay] = useState(21);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [thresholdValue, setThresholdValue] = useState(10500);
  
  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      const savedResetDay = await loadData('resetDay');
      const savedThreshold = await loadData('thresholdValue');
      const savedNotifications = await loadData('notificationsEnabled');
      
      if (savedResetDay !== null) setResetDay(savedResetDay);
      if (savedThreshold !== null) setThresholdValue(savedThreshold);
      if (savedNotifications !== null) setNotificationsEnabled(savedNotifications);
    };
    
    loadSettings();
  }, []);
  
  // Save settings when they change
  useEffect(() => {
    saveData('resetDay', resetDay);
  }, [resetDay]);
  
  useEffect(() => {
    saveData('thresholdValue', thresholdValue);
  }, [thresholdValue]);
  
  useEffect(() => {
    saveData('notificationsEnabled', notificationsEnabled);
  }, [notificationsEnabled]);
  
  // Generate days 1-31 to accommodate all possible month lengths
  const daysOfMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  
  return (
    <ScrollView className="flex-1 bg-white pt-20">
      <Text className="font-rubik-bold text-3xl mx-4 mb-6">Settings</Text>
      
      <View className="mx-4 mb-6">
        <Text className="font-rubik-medium text-lg mb-2">Reset Day</Text>
        <Text className="font-rubik text-black-200 mb-4">
          All WiFi counters will reset on the selected day of each month
        </Text>
        
        <View className="flex-row mx-5 flex-wrap">
          {daysOfMonth.map(day => (
            <TouchableOpacity 
              key={day}
              onPress={() => setResetDay(day)}
              className={`w-10 h-10 rounded-full mr-2 mb-2 items-center justify-center 
          ${resetDay === day ? 'bg-primary-300' : 'bg-primary-100'}`}
            >
              <Text 
          className={`font-rubik-medium ${resetDay === day ? 'text-white' : 'text-primary-300'}`}
              >
          {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text className="font-rubik text-xs text-primary-300 mt-2">
          You have selected {resetDay}{resetDay === 1 ? 'st' : resetDay === 2 ? 'nd' : resetDay === 3 ? 'rd' : 'th'} of every month. 
          The WTFi app counter will reset on this day.
        </Text>
      </View>
      <View className="mx-4 mb-6">
        <Text className="font-rubik-medium text-lg mb-2">Notifications</Text>
        
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="font-rubik">Enable Notifications</Text>
            <Text className="font-rubik text-xs text-black-200">Get alerts when WiFi usage reaches threshold</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#E1E1E1', true: '#0061FF' }}
            thumbColor="#ffffff"
          />
        </View>
        
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="font-rubik">Alert Threshold</Text>
            <Text className="font-rubik text-xs text-black-200">Minutes before sending notification</Text>
          </View>
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => setThresholdValue(Math.max(0, thresholdValue - 500))}
              className="bg-primary-100 w-8 h-8 rounded-full items-center justify-center"
            >
              <Text className="font-rubik-bold text-primary-300">-</Text>
            </TouchableOpacity>
            
            <Text className="font-rubik-medium mx-3 w-20 text-center">{thresholdValue}</Text>
            
            <TouchableOpacity 
              onPress={() => setThresholdValue(Math.min(12000, thresholdValue + 500))}
              className="bg-primary-100 w-8 h-8 rounded-full items-center justify-center"
            >
              <Text className="font-rubik-bold text-primary-300">+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
    
   
      
      <View className="mx-4 mb-20 mt-10">
      <Text className="font-rubik text-center text-black text-sm ">
           
      </Text>
      </View>
    </ScrollView>
  );
};

export default AppSettings;