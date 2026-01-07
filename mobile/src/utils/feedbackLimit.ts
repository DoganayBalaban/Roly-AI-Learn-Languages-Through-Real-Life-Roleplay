import * as SecureStore from "expo-secure-store";

const DAILY_FEEDBACK_LIMIT = 3;
const FEEDBACK_COUNT_KEY = "daily_feedback_count";
const LAST_FEEDBACK_DATE_KEY = "last_feedback_date";

/**
 * Günlük feedback sayısını kontrol eder ve artırır
 * @returns {Promise<{canView: boolean, count: number, remaining: number}>}
 */
export const checkAndIncrementFeedbackCount = async (): Promise<{
  canView: boolean;
  count: number;
  remaining: number;
}> => {
  try {
    const today = new Date().toDateString();
    const lastDate = await SecureStore.getItemAsync(LAST_FEEDBACK_DATE_KEY);
    let count = 0;

    // Eğer bugün ilk feedback ise veya farklı bir günse sayacı sıfırla
    if (lastDate !== today) {
      await SecureStore.setItemAsync(LAST_FEEDBACK_DATE_KEY, today);
      await SecureStore.setItemAsync(FEEDBACK_COUNT_KEY, "0");
      count = 0;
    } else {
      // Aynı günse mevcut sayıyı al
      const storedCount = await SecureStore.getItemAsync(FEEDBACK_COUNT_KEY);
      count = storedCount ? parseInt(storedCount, 10) : 0;
    }

    // Limit kontrolü
    if (count >= DAILY_FEEDBACK_LIMIT) {
      return {
        canView: false,
        count,
        remaining: 0,
      };
    }

    // Sayacı artır
    count += 1;
    await SecureStore.setItemAsync(FEEDBACK_COUNT_KEY, count.toString());

    return {
      canView: true,
      count,
      remaining: DAILY_FEEDBACK_LIMIT - count,
    };
  } catch (error) {
    console.error("Feedback count check error:", error);
    // Hata durumunda izin ver (fail-safe)
    return {
      canView: true,
      count: 0,
      remaining: DAILY_FEEDBACK_LIMIT,
    };
  }
};

/**
 * Günlük feedback sayısını alır (artırmadan)
 * @returns {Promise<{count: number, remaining: number}>}
 */
export const getFeedbackCount = async (): Promise<{
  count: number;
  remaining: number;
}> => {
  try {
    const today = new Date().toDateString();
    const lastDate = await SecureStore.getItemAsync(LAST_FEEDBACK_DATE_KEY);

    // Eğer bugün ilk feedback ise veya farklı bir günse sayacı sıfırla
    if (lastDate !== today) {
      return {
        count: 0,
        remaining: DAILY_FEEDBACK_LIMIT,
      };
    }

    const storedCount = await SecureStore.getItemAsync(FEEDBACK_COUNT_KEY);
    const count = storedCount ? parseInt(storedCount, 10) : 0;

    return {
      count,
      remaining: Math.max(0, DAILY_FEEDBACK_LIMIT - count),
    };
  } catch (error) {
    console.error("Get feedback count error:", error);
    return {
      count: 0,
      remaining: DAILY_FEEDBACK_LIMIT,
    };
  }
};
