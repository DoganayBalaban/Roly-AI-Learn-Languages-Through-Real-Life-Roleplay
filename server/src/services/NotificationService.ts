import { Expo } from "expo-server-sdk";
import cron from "node-cron";
import User from "../models/User";

const expo = new Expo();

export const sendPushNotifications = async (
  pushToken: string,
  title: string,
  body: string
) => {
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
    return;
  }
  const messages = [
    {
      to: pushToken,
      sound: "default",
      title: title,
      body: body,
      data: { url: "rolyai://home" },
    },
  ];
  try {
    await expo.sendPushNotificationsAsync(messages as any);
    console.log("Notification sent successfully");
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};
export const initCronJobs = () => {
  console.log("Cron job başlatıldı: Inactive user check");
  cron.schedule("0 19 * * *", async () => {
    console.log("Bildirim taraması başladı.");
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    try {
      const inactiveUsers = await User.find({
        "stats.lastActivityDate": { $lt: twoDaysAgo, $gt: sevenDaysAgo },
        pushToken: { $exists: true, $ne: null },
      });
      for (const user of inactiveUsers) {
        if (user.pushToken) {
          const msg = `Hey ${
            user.fullName.split(" ")[0]
          }! 👋 Serin bozulmak üzere!`;
          await sendPushNotifications(
            user.pushToken,
            "RolyAI Seni Özledi",
            msg
          );
        }
      }
    } catch (error) {
      console.error("Cron Job Hatası:", error);
    }
  });
};
