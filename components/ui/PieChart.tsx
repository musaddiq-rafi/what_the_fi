import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface PieChartProps {
  percentage: number;
  radius?: number;
  strokeWidth?: number;
}

const PieChart = ({ 
  percentage, 
  radius = 40, 
  strokeWidth = 10 
}: PieChartProps) => {
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <View className="items-center">
      <Svg width={100} height={100} viewBox="0 0 100 100">
        {/* Background Circle */}
        <Circle
          cx="50"
          cy="50"
          r={radius}
          stroke="#E8E8E8"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Arc */}
        <Path
          d={`
            M 50,50
            m 0,-${radius}
            a ${radius},${radius} 0 1 1 0,${2 * radius}
            a ${radius},${radius} 0 1 1 0,-${2 * radius}
          `}
          stroke="#0061FF"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          fill="transparent"
          strokeLinecap="round"
        />
      </Svg>
      <Text className="font-rubik-bold text-lg mt-2">{Math.round(percentage)}%</Text>
      <Text className="font-rubik text-xs text-black-200">Used</Text>
    </View>
  );
};

export default PieChart;