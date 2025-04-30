import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import PieChart from '../ui/PieChart';

interface ActiveWifiProps {
    id: string;
    name: string;
    username: string;
    usedMinutes: number;
    totalMinutes: number;
    onStop: () => void;
    onEdit: () => void;
    approachingLimit: number;  // Add this prop
    resetDay: number;         // Add this prop
  }

const ActiveWifi = ({ 
  id, 
  name, 
  username, 
  usedMinutes, 
  totalMinutes, 
  onStop, 
  onEdit, 
  approachingLimit,  // Use the prop instead of hardcoded value
  resetDay 
}: ActiveWifiProps) => {
  const percentage = Math.min(100, (usedMinutes / totalMinutes) * 100);
  const isApproachingLimit = usedMinutes > approachingLimit;
  
  return (
    <View className="bg-primary-100 p-4 rounded-xl border border-primary-200">
      <View className="flex-row justify-between items-center mb-2">
        <View>
          <Text className='font-rubik-medium text-base text-primary-300'>Currently using</Text>
          <Text className="font-rubik-bold text-xl">{name}</Text>
          <Text className='font-rubik-light text-primary-300'>Approaching limit set to {approachingLimit}</Text>
          <Text className='font-rubik-light text-primary-300'>Reset day: {resetDay}{resetDay === 1 ? 'st' : resetDay === 2 ? 'nd' : resetDay === 3 ? 'rd' : 'th'}</Text>
        </View>
        <TouchableOpacity onPress={onEdit}>
          <Text className="text-primary-300 font-rubik">Edit</Text>
        </TouchableOpacity>
      </View>
      <Text className="font-rubik text-xs text-black-200 mb-1">ID: {id}</Text>
      <Text className="font-rubik text-xs text-black-200 mb-1">Username: {username}</Text>
      <Text className="font-rubik text-xs text-black-200 mb-1">Password: Click 'Edit' to view</Text>

      <View className="flex-row justify-between items-center">
        <View>
          <Text className="font-rubik-medium text-sm text-black-200">Used Minutes</Text>
          <Text className="font-rubik-bold text-3xl text-primary-300">{usedMinutes}</Text>
          <Text className="font-rubik text-xs text-black-100">of {totalMinutes} minutes</Text>
          
          {isApproachingLimit && (
            <View className="mt-2 bg-danger/20 px-3 py-1 rounded-full">
              <Text className="text-danger font-rubik-medium text-xs">Approaching Limit exceeded</Text>
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