import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Save data to AsyncStorage with error handling
 * @param key Storage key
 * @param value Data to store
 */
export const saveData = async (key: string, value: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving data for key "${key}":`, error);
    throw error;
  }
};

/**
 * Load data from AsyncStorage with error handling
 * @param key Storage key to retrieve
 * @returns Parsed data or null if not found
 */
export const loadData = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error loading data for key "${key}":`, error);
    throw error;
  }
};

/**
 * Remove data from AsyncStorage with error handling
 * @param key Storage key to remove
 */
export const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing data for key "${key}":`, error);
    throw error;
  }
};

/**
 * Clear all app data from AsyncStorage with error handling
 */
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};

/**
 * Export all app data as JSON string for backup
 * @returns JSON string with all app data
 */
export const exportData = async (): Promise<string> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const result = await AsyncStorage.multiGet(keys);
    
    const exportObject: Record<string, any> = {};
    result.forEach(([key, value]) => {
      if (value) {
        try {
          exportObject[key] = JSON.parse(value);
        } catch {
          // If value can't be parsed as JSON, store as string
          exportObject[key] = value;
        }
      }
    });
    
    return JSON.stringify(exportObject, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};

/**
 * Import data from a backup JSON string
 * @param jsonData JSON string containing backup data
 */
export const importData = async (jsonData: string): Promise<void> => {
  try {
    const data = JSON.parse(jsonData);
    const entries = Object.entries(data);
    
    // Clear existing data first
    await AsyncStorage.clear(); 
    
    // Import all key-value pairs
    for (const [key, value] of entries) {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
};

/**
 * Get the total storage size for the app
 * @returns Size in bytes
 */
export const getStorageSize = async (): Promise<number> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const result = await AsyncStorage.multiGet(keys);
    
    let totalSize = 0;
    result.forEach(([key, value]) => {
      if (value) {
        totalSize += key.length + value.length;
      }
    });
    
    return totalSize;
  } catch (error) {
    console.error('Error calculating storage size:', error);
    throw error;
  }
};