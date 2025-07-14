// import * as BackgroundFetch from 'expo-background-fetch';
// import * as TaskManager from 'expo-task-manager';
// import * as Notifications from 'expo-notifications';
// import { loadData, saveData } from './storage';
// import { checkResetDate } from './dateUtils';
// import { getFunnyNotification } from '../app/index';

// const BACKGROUND_FETCH_TASK = 'background-wifi-counter';

// // Define the background task
// TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
//   try {
//     // Load connections and settings
//     const connections = await loadData('connections') as Array<{
//       id: string;
//       name: string;
//       isActive: boolean;
//       usedMinutes: number;
//       totalMinutes: number;
//       lastUpdated?: number;
//     }> || [];

//     // Early return if no connections
//     if (!connections || connections.length === 0) {
//       return BackgroundFetch.BackgroundFetchResult.NoData;
//     }

//     const activeConnection = connections.find((conn) => conn.isActive);
//     if (!activeConnection) {
//       return BackgroundFetch.BackgroundFetchResult.NoData;
//     }

//     // Load settings
//     const resetDay = Number(await loadData('resetDay')) || 21;
//     const thresholdValue = Number(await loadData('thresholdValue')) || 10500;
//     const lastNotificationTime = Number(await loadData('lastNotificationTime')) || 0;
//     const currentTime = Date.now();

//     // Check if reset is needed
//     const shouldReset = checkResetDate(resetDay);
//     if (shouldReset) {
//       const resetConnections = connections.map(conn => ({
//         ...conn,
//         usedMinutes: 0
//       }));
//       await saveData('connections', resetConnections);
//       await saveData('lastResetDate', new Date().toISOString());
//       return BackgroundFetch.BackgroundFetchResult.NewData;
//     }

//     // Update usage and check threshold
//     const lastUpdated = activeConnection.lastUpdated || currentTime;
//     const minutesElapsed = Math.floor((currentTime - lastUpdated) / 60000);
    
//     if (minutesElapsed > 0) {
//       // Update the active connection's usage
//       const updatedConnections = connections.map(conn => 
//         conn.isActive ? {
//           ...conn,
//           usedMinutes: Math.min(conn.usedMinutes + minutesElapsed, conn.totalMinutes),
//           lastUpdated: currentTime
//         } : conn
//       );
      
//       await saveData('connections', updatedConnections);

//       // Check if notification should be sent
//       const twoHoursInMs = 2 * 60 * 60 * 1000;
//       if (activeConnection.usedMinutes > thresholdValue && 
//           (currentTime - lastNotificationTime >= twoHoursInMs)) {
        
//         await Notifications.scheduleNotificationAsync({
//           content: {
//             title: "WiFi Usage Alert!",
//             body: getFunnyNotification(activeConnection.usedMinutes, activeConnection.name),
//             data: { id: activeConnection.id },
//           },
//           trigger: null,
//         });
        
//         await saveData('lastNotificationTime', currentTime);
//       }

//       return BackgroundFetch.BackgroundFetchResult.NewData;
//     }

//     return BackgroundFetch.BackgroundFetchResult.NoData;

//   } catch (error) {
//     console.error('Background task error:', error);
//     return BackgroundFetch.BackgroundFetchResult.Failed;
//   }
// });

// // Register the background fetch task
// export async function registerBackgroundTask() {
//   try {
//     await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
//       minimumInterval: 15 * 60, // 15 minutes
//       stopOnTerminate: false, // Continue running when app is terminated
//       startOnBoot: true // Start task on device boot
//     });
//     console.log('Background task registered');
//   } catch (err) {
//     console.error('Task registration failed:', err);
//   }
// }