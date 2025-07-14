// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useState } from 'react';

// export const useStorage = () => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const saveData = async (key: string, value: any) => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       await AsyncStorage.setItem(key, JSON.stringify(value));
//     } catch (e: any) {
//       setError(e.message);
//       console.error('Error saving data:', e);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const loadData = async (key: string) => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const data = await AsyncStorage.getItem(key);
//       if (data) {
//         return JSON.parse(data);
//       }
//       return null;
//     } catch (e: any) {
//       setError(e.message);
//       console.error('Error loading data:', e);
//       return null;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const removeData = async (key: string) => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       await AsyncStorage.removeItem(key);
//     } catch (e: any) {
//       setError(e.message);
//       console.error('Error removing data:', e);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return {
//     saveData,
//     loadData,
//     removeData,
//     isLoading,
//     error,
//   };
// };