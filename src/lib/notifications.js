// Local notifications for prayer times.
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { getPrayerTimes, PRAYERS } from './prayer';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission() {
  if (Platform.OS === 'web') return false;
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.status === 'granted';
}

// Prayers that get an adhan reminder (skip sunrise).
const NOTIFY_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

// Schedule today's + the next few days' prayer notifications.
export async function schedulePrayerNotifications(location, calcMethod, madhab, days = 3) {
  if (Platform.OS === 'web') return 0;
  await Notifications.cancelAllScheduledNotificationsAsync();
  let count = 0;
  const now = new Date();
  for (let d = 0; d < days; d++) {
    const date = new Date();
    date.setDate(now.getDate() + d);
    const times = getPrayerTimes(location.lat, location.lng, date, calcMethod, madhab);
    for (const key of NOTIFY_KEYS) {
      const t = times[key];
      if (!t || t <= now) continue;
      const meta = PRAYERS.find((p) => p.key === key);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `کاتی نوێژی ${meta?.name || ''}`,
          body: 'کاتی نوێژ هات — اللَّهُ أَكْبَر',
          sound: true,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: t },
      });
      count++;
    }
  }
  return count;
}

export async function cancelPrayerNotifications() {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
