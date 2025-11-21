// scripts/backgroundNotifications.ts
/**
 * Setup background notification handler for when app is killed or backgrounded.
 * Must be called as early as possible in app initialization.
 */

import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND_NOTIFICATION_TASK';

// Define the background task
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }: any) => {
  if (error) {
    console.error('[BackgroundNotification] Error:', error);
    return;
  }

  try {
    const notification = (data as any)?.notification;
    if (!notification) return;

    const deepLink = (notification as any)?.request?.content?.data?.deepLink as string | undefined;
    
    // Log background notification received
    console.log('[BackgroundNotification] Received:', {
      title: notification?.request?.content?.title,
      body: notification?.request?.content?.body,
      deepLink,
    });

    // You can't use router.push in background tasks since the app is not running.
    // Background notifications will be handled by NotificationResponseReceivedListener
    // when user taps on the notification and app restarts.
  } catch (e) {
    console.error('[BackgroundNotification] Handler error:', e);
  }
});

/**
 * Initialize background notification handling.
 * Call this early in app startup (e.g., in app.js or root layout).
 */
export async function initializeBackgroundNotifications() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_TASK);
    
    if (!isRegistered) {
      await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
      console.log('[BackgroundNotifications] Task registered successfully');
    } else {
      console.log('[BackgroundNotifications] Task already registered');
    }
  } catch (error) {
    console.error('[BackgroundNotifications] Failed to register task:', error);
  }
}

export { BACKGROUND_NOTIFICATION_TASK };
