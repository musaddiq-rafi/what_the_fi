import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import PieChart from '../ui/PieChart';

interface ActiveWifiProps {
  id: string;
  name: string;
  usedMinutes: number;
  totalMinutes: number;
  onStop: () => void;
}

const ActiveWifi = ({ id, name, usedMinutes, totalMinutes, onStop }: ActiveWifiProps) => {
  const percentage = Math.min(100, (usedMinutes / totalMinutes) * 100);
  const isApproachingLimit = usedMinutes > 10500;
  
  return (
    <View className="bg-primary-100 p-4 rounded-xl border border-primary-200">
      <Text className="font-rubik-bold text-xl mb-1">{name}</Text>
      <Text className="font-rubik text-xs text-black-200 mb-4">ID: {id}</Text>
      
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="font-rubik-medium text-sm text-black-200">Used Minutes</Text>
          <Text className="font-rubik-bold text-3xl text-primary-300">{usedMinutes}</Text>
          <Text className="font-rubik text-xs text-black-100">of {totalMinutes} minutes</Text>
          
          {isApproachingLimit && (
            <View className="mt-2 bg-danger/20 px-3 py-1 rounded-full">
              <Text className="text-danger font-rubik-medium text-xs">Approaching Limit</Text>
            </View>
          )}
          
          <TouchableOpacity 
            className="bg-danger mt-4 py-2 px-4 rounded-lg" 
            onPress={onStop}
          >
            <Text className="font-rubik-medium text-white text-center">Stop Tracking</Text>
          </TouchableOpacity>
        </View>
        
        <PieChart percentage={percentage} />
      </View>
    </View>
  );
};

export default ActiveWifi;