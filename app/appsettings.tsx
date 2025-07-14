import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView, TextInput, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import icons from '@/constants/icons';
import { Image } from 'react-native';
import WebViewScraper from '@/components/WebViewScrapper';

const AppSettings = () => {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [thresholdValue, setThresholdValue] = useState(10500);
  
  // Default to the WiFi portal URL
  const [scrapingUrl, setScrapingUrl] = useState('http://10.220.20.12/index.php/home/login');
  const [scrapingUsername, setScrapingUsername] = useState('');
  const [scrapingPassword, setScrapingPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  
  // State to store the last scraped data
  const [lastScrapedMinutes, setLastScrapedMinutes] = useState<number | null>(null);
  const [lastScrapedUsername, setLastScrapedUsername] = useState<string | null>(null);
  const [lastScrapedTime, setLastScrapedTime] = useState<number | null>(null);
  
  const handleTestConnection = async () => {
    // Validate inputs
    if (!scrapingUrl || !scrapingUsername || !scrapingPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    
    // Show the WebView scraper
    setIsLoading(true);
    setShowWebView(true);
  };
  
  function validateMinutes(minutes: number): boolean {
    // Check if minutes is a valid number
    if (!Number.isFinite(minutes)) {
      return false;
    }
    
    // Minutes should be non-negative
    if (minutes < 0) {
      return false;
    }
    
    // Set an upper reasonable limit (about a month of usage)
    // This is a sanity check to catch unreasonably high values
    if (minutes > 50000) {
      return false;
    }
    
    return true;
  }

  return (
    <ScrollView className="flex-1 bg-white pt-20">
      <Stack.Screen options={{ headerShown: false }} />
      
      <View className="flex-row items-center px-4 mb-6">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Image source={icons.backArrow} className="size-6" />
        </TouchableOpacity>
        <Text className="font-rubik-bold text-3xl">Settings</Text>
      </View>
      
      <View className="mx-4 mb-6">
        <Text className="font-rubik-medium text-lg mb-2">WiFi Portal Login</Text>
        <Text className="font-rubik text-black-200 mb-4">
          Enter your credentials to log in to the WiFi portal
        </Text>
        
        <View className="mb-4">
          <Text className="font-rubik-medium text-sm mb-1">Portal URL</Text>
          <TextInput
            value={scrapingUrl}
            onChangeText={setScrapingUrl}
            className="border border-primary-200 rounded-lg p-3 font-rubik"
            placeholder="http://10.220.20.12/index.php/home/login"
          />
          <Text className="font-rubik text-xs text-black-200 mt-1">
            Default: http://10.220.20.12/index.php/home/login
          </Text>
        </View>
        
        <View className="mb-4">
          <Text className="font-rubik-medium text-sm mb-1">Email</Text>
          <TextInput
            value={scrapingUsername}
            onChangeText={setScrapingUsername}
            className="border border-primary-200 rounded-lg p-3 font-rubik"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View className="mb-4">
          <Text className="font-rubik-medium text-sm mb-1">Password</Text>
          <TextInput
            value={scrapingPassword}
            onChangeText={setScrapingPassword}
            className="border border-primary-200 rounded-lg p-3 font-rubik"
            placeholder="Enter your password"
            secureTextEntry
          />
        </View>
        
        <TouchableOpacity 
          className={`py-3 rounded-lg mb-6 ${isLoading ? 'bg-primary-100' : 'bg-primary-300'}`}
          onPress={handleTestConnection}
          disabled={isLoading}
        >
          <Text className="text-white text-center font-rubik-medium">
            {isLoading ? "Connecting..." : "Connect to Portal"}
          </Text>
        </TouchableOpacity>
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
      
      {/* Display last scraped data if available */}
      {lastScrapedMinutes !== null && (
        <View className="mx-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <Text className="font-rubik-medium text-base mb-1">Last Scraped Data</Text>
          {lastScrapedUsername && (
            <Text className="font-rubik text-sm">Username: {lastScrapedUsername}</Text>
          )}
          <Text className="font-rubik text-sm">Minutes used: {lastScrapedMinutes}</Text>
          {lastScrapedTime && (
            <Text className="font-rubik text-xs text-black-200 mt-1">
              {new Date(lastScrapedTime).toLocaleString()}
            </Text>
          )}
        </View>
      )}
      
      <View className="mx-4 mb-20 mt-10">
        <Text className="font-rubik text-center text-black-200 text-xs">
          Note: This app no longer runs in the background.
          You must manually open it to check your WiFi usage.
        </Text>
      </View>
      
      {/* WebView Scraper Modal */}
      <WebViewScraper
        visible={showWebView}
        url={scrapingUrl}
        username={scrapingUsername}
        password={scrapingPassword}
        onSuccess={(data) => {
          setShowWebView(false);
          setIsLoading(false);
          
          // Check if data is an object with minutes property (new format)
          if (typeof data === 'object' && data.minutes) {
            if (validateMinutes(data.minutes)) {
              Alert.alert(
                "Success", 
                `Found data for ${data.username || 'user'}:\nWiFi usage: ${data.minutes} minutes`
              );
              
              // Store data in local state instead of using storage
              setLastScrapedMinutes(data.minutes);
              setLastScrapedUsername(data.username);
              setLastScrapedTime(Date.now());
            } else {
              Alert.alert(
                "Warning", 
                `Extracted value (${data.minutes}) doesn't look like valid minutes. Please check manually.`
              );
            }
          } 
          // Handle legacy format where only minutes are passed as a number
          else if (typeof data === 'number') {
            if (validateMinutes(data)) {
              Alert.alert(
                "Success", 
                `Found WiFi usage: ${data} minutes`
              );
              
              // Store data in local state
              setLastScrapedMinutes(data);
              setLastScrapedTime(Date.now());
            } else {
              Alert.alert(
                "Warning", 
                `Extracted value (${data}) doesn't look like valid minutes. Please check manually.`
              );
            }
          }
        }}
        onClose={() => {
          setShowWebView(false);
          setIsLoading(false);
        }}
      />
    </ScrollView>
  );
};

export default AppSettings;