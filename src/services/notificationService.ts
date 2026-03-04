import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.warn('Notifications only work on physical devices');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366F1',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function scheduleDailyReminder(hour: number, minute: number): Promise<string | null> {
  const hasPermission = await requestPermissions();
  if (!hasPermission) return null;

  // Cancel existing daily reminders
  await cancelDailyReminders();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '📖 Time to plan your day',
      body: "Open Concursus to review today's tasks and Bible readings.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  return id;
}

export async function cancelDailyReminders(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduled) {
    if ((notification.content.title as string)?.includes('Time to plan')) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

export async function scheduleTaskReminder(
  taskId: string,
  title: string,
  date: string,
  time: string
): Promise<string | null> {
  const hasPermission = await requestPermissions();
  if (!hasPermission) return null;

  try {
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    const triggerDate = new Date(year, month - 1, day, hour, minute);

    if (triggerDate <= new Date()) return null; // Past time

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ ${title}`,
        body: 'Task reminder from Concursus',
        data: { taskId },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
    return id;
  } catch {
    return null;
  }
}

export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
