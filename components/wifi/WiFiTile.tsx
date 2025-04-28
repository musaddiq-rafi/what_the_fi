import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

interface WifiTileProps {
  id: string;
  name: string;
  usedMinutes: number;
  totalMinutes: number;
  isActive: boolean;
  onActivate: () => void;
}

const WifiTile = ({ id, name, usedMinutes, totalMinutes, isActive, onActivate }: WifiTileProps) => {
  const router = useRouter();
  
  const handleEdit = () => {
    router.push({
      pathname: '/edit-wifi',
      params: { id }
    });
  };

  return (
    <TouchableOpacity 
      className={`rounded-xl p-4 ${isActive ? 'bg-primary-200' : 'bg-accent-100'} border border-primary-200`}
      onPress={onActivate}
    >
      <View className="flex-row justify-between mb-2">
        <Text className="font-rubik-medium text-base">{name}</Text>
        <TouchableOpacity onPress={handleEdit}>
          <Text className="text-primary-300 font-rubik">Edit</Text>
        </TouchableOpacity>
      </View>
      
      <Text className="font-rubik text-xs text-black-200 mb-3">ID: {id}</Text>
      
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="font-rubik-medium text-xs text-black-100">USED</Text>
          <Text className="font-rubik-semibold text-lg">{usedMinutes} min</Text>
        </View>
        
        <View>
          <Text className="font-rubik-medium text-xs text-black-100">REMAINING</Text>
          <Text className="font-rubik-semibold text-lg">{totalMinutes - usedMinutes} min</Text>
        </View>
      </View>
      
      {!isActive && (
        <TouchableOpacity 
          className="bg-primary-300 py-2 rounded-lg mt-3" 
          onPress={onActivate}
        >
          <Text className="font-rubik-medium text-white text-center">Start Tracking</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default WifiTile;