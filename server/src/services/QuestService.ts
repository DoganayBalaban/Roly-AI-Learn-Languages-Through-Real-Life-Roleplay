import User, { IUser } from "../models/User";

// Standart Görev Havuzu
const QUEST_TEMPLATES = [
  {
    type: "SESSION_COMPLETE",
    description: "1 Senaryo Tamamla",
    target: 1,
    xp: 50,
  },
  { type: "WORD_SAVE", description: "3 Yeni Kelime Kaydet", target: 3, xp: 50 },
  { type: "VOICE_USE", description: "Sesli Konuşma Yap", target: 1, xp: 50 },
];

// --- GÜNLÜK GÖREVLERİ KONTROL ET VE OLUŞTUR ---
export const checkAndResetQuests = async (user: IUser) => {
  const now = new Date();
  const lastReset = new Date(user.quests.lastResetDate || 0);

  // Tarihler aynı gün mü?
  const isSameDay =
    now.getFullYear() === lastReset.getFullYear() &&
    now.getMonth() === lastReset.getMonth() &&
    now.getDate() === lastReset.getDate();

  // Eğer bugün değilse veya hiç görevi yoksa YENİLE
  if (!isSameDay || user.quests.daily.length === 0) {
    const newQuests = QUEST_TEMPLATES.map((q, index) => ({
      id: `quest_${now.getTime()}_${index}`,
      type: q.type,
      description: q.description,
      target: q.target,
      progress: 0,
      isCompleted: false,
      isClaimed: false,
      xpReward: q.xp,
    }));

    user.quests.daily = newQuests as any;
    user.quests.lastResetDate = now;
    await user.save();
  }
};

// --- İLERLEMEYİ GÜNCELLE ---
// Bu fonksiyonu ChatController ve WordController içinden çağıracağız
export const updateQuestProgress = async (
  userId: string,
  type: "SESSION_COMPLETE" | "WORD_SAVE" | "VOICE_USE",
  amount: number = 1
) => {
  const user = await User.findById(userId);
  if (!user) return;

  // Önce tarih kontrolü yap (Gece yarısı geçtiyse sıfırla)
  await checkAndResetQuests(user);

  let questUpdated = false;

  // İlgili tipteki görevleri bul ve güncelle
  user.quests.daily.forEach((quest) => {
    if (quest.type === type && !quest.isCompleted) {
      quest.progress += amount;

      // Hedefe ulaşıldı mı?
      if (quest.progress >= quest.target) {
        quest.progress = quest.target;
        quest.isCompleted = true;
        // Otomatik ödül verelim mi? Yoksa kullanıcı "Ödülü Al" butonuna mı bassın?
        // Gamification için "Ödülü Al" butonu daha tatmin edicidir ama şimdilik OTOMATİK verelim.
      }
      questUpdated = true;
    }
  });

  if (questUpdated) {
    await user.save();
  }

  return user.quests.daily;
};
