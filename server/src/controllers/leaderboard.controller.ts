import { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import User from "../models/User";

export const getLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    const { type = "all" } = req.query; // "weekly" veya "all"
    const userId = req.user._id;

    // Haftalık XP sıfırlama kontrolü (Her Pazartesi sıfırla)
    // Not: Bu kontrol her kullanıcı için endSession'da yapılıyor
    // Burada sadece leaderboard verilerini çekiyoruz

    // Leaderboard verilerini çek
    const sortField = type === "weekly" ? "stats.weeklyXp" : "stats.xp";
    const sortObj: any = {};
    sortObj[sortField] = -1;

    const users = await User.find({})
      .select(
        "fullName avatarId stats.xp stats.weeklyXp stats.streak preferences.targetLanguage"
      )
      .sort(sortObj)
      .limit(100); // İlk 100 kullanıcı

    // Kullanıcının kendi sırasını bul
    const currentUserXp =
      type === "weekly" ? req.user.stats.weeklyXp : req.user.stats.xp;

    const userRank =
      users.findIndex((u) => u._id.toString() === userId.toString()) + 1;

    // Eğer kullanıcı ilk 100'de değilse, sırasını hesapla
    let actualRank = userRank;
    if (userRank === 0) {
      const queryObj: any = {};
      queryObj[sortField] = { $gt: currentUserXp };
      const usersAbove = await User.countDocuments(queryObj);
      actualRank = usersAbove + 1;
    }

    // Leaderboard verilerini formatla
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      userId: user._id.toString(),
      fullName: user.fullName,
      avatarId: user.avatarId,
      xp: type === "weekly" ? user.stats.weeklyXp : user.stats.xp,
      streak: user.stats.streak,
      targetLanguage: user.preferences?.targetLanguage || "English",
      isCurrentUser: user._id.toString() === userId.toString(),
    }));

    // Kullanıcının kendi bilgilerini ekle (eğer ilk 100'de değilse)
    let currentUserData = null;
    if (userRank === 0) {
      currentUserData = {
        rank: actualRank,
        userId: req.user._id.toString(),
        fullName: req.user.fullName,
        avatarId: req.user.avatarId,
        xp: currentUserXp,
        streak: req.user.stats.streak,
        targetLanguage: req.user.preferences?.targetLanguage || "English",
        isCurrentUser: true,
      };
    }

    res.json({
      leaderboard,
      currentUser: currentUserData || leaderboard.find((u) => u.isCurrentUser),
      type,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
};
