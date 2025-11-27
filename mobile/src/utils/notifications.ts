import * as Notifications from "expo-notifications";
import { Alert, Platform } from "react-native";

// 1. Bildirim İzni İste
export async function registerForPushNotificationsAsync() {
  let token;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    Alert.alert(
      "İzin Gerekli",
      "Hatırlatıcılar için bildirim izni vermelisiniz."
    );
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return true;
}

// 2. Günlük Bildirim Kur (Örn: Her akşam 20:00'de)
export async function scheduleDailyReminder() {
  const hasPermission = await registerForPushNotificationsAsync();
  if (!hasPermission) return;

  // Önce eski bildirimleri temizle (Çakışma olmasın)
  await Notifications.cancelAllScheduledNotificationsAsync();

  const trigger: Notifications.DailyTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour: 20, // Saat 20:00
    minute: 0,
  };

  // Yeni bildirimi kur
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Pratik Zamanı! 🕒",
      body: "5 dakikanı ayır ve bugünkü senaryonu tamamla. Serini bozma! 🔥",
      sound: true,
    },
    trigger,
  });

  // Alert.alert("Başarılı", "Günlük hatırlatıcı 20:00'ye kuruldu.");
}

// 3. Bildirimleri İptal Et
export async function cancelReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
