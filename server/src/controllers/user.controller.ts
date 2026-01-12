import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import type { AuthRequest } from "../middlewares/auth.middleware";
import Session from "../models/Session";
import User from "../models/User";
import { checkAndResetQuests } from "../services/QuestService";
import { loginSchema, registerSchema } from "../utils/validation";

const calculateLevel = (xp: number) => {
  // Basit bir seviye sistemi:
  if (xp < 500)
    return { current: "A1", next: "A2", progress: (xp / 500) * 100 };
  if (xp < 1500)
    return { current: "A2", next: "B1", progress: ((xp - 500) / 1000) * 100 };
  if (xp < 3000)
    return { current: "B1", next: "B2", progress: ((xp - 1500) / 1500) * 100 };
  if (xp < 5000)
    return { current: "B2", next: "C1", progress: ((xp - 3000) / 2000) * 100 };
  return { current: "C1", next: "C2", progress: 100 };
};

const googleClient = new OAuth2Client(config.googleClientId);

export const getUserStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;

    // 1. Kullanıcı Bilgileri (XP ve Kelimeler)
    const user = await User.findById(userId);
    const totalWords = user?.savedWords.length || 0;
    const xp = user?.stats.xp || 0;
    const levelInfo = calculateLevel(xp);

    // 2. Toplam Oturum Sayısı (Tamamlanmış)
    const totalSessions = await Session.countDocuments({
      userId,
      status: "completed",
    });

    // 3. Tahmini Pratik Süresi (Her mesajı ortalama 1 dakika sayalım)
    // Tüm sessionlardaki mesaj sayısını topla
    const allSessions = await Session.find({ userId, status: "completed" });
    let totalMessages = 0;
    allSessions.forEach((sess) => (totalMessages += sess.messages.length));
    const totalHours = Math.floor(totalMessages / 60); // Dakikayı saate çevir (Örn: 120 msg = 2 saat)

    // 4. Son 3 Geri Bildirim
    const recentReports = await Session.find({ userId, status: "completed" })
      .sort({ updatedAt: -1 })
      .limit(3)
      .select("scenario updatedAt difficultyLevel"); // Sadece lazım olan alanlar

    // 5. Haftalık Aktivite Grafiği (Son 7 Gün)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklySessions = await Session.find({
      userId,
      updatedAt: { $gte: sevenDaysAgo },
    });

    // Grafiği oluştur (Pzt: 2, Sal: 0 vs.)
    const days = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
    const chartData = Array(7)
      .fill(0)
      .map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i)); // Bugünden geriye doğru
        const dayName = days[d.getDay()];

        // O günkü session sayısını bul
        const count = weeklySessions.filter((s) => {
          const sDate = new Date(s.updatedAt);
          return (
            sDate.getDate() === d.getDate() && sDate.getMonth() === d.getMonth()
          );
        }).length;

        // Grafik yüzdesi (Max 5 session %100 olsun)
        const percent = Math.min((count / 5) * 100, 100);

        return { day: dayName, percent, count };
      });
    await checkAndResetQuests(user!);
    // Response Hazırla
    res.json({
      level: levelInfo,
      stats: {
        completedSessions: totalSessions,
        learnedWords: totalWords,
        practiceHours: totalHours || 1, // Hiç yoksa 1 göster motive olsun
        weeklyCount: weeklySessions.length,
      },
      chart: chartData,
      recentReports,
      quests: user?.quests.daily,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Stats failed" });
  }
};
export const register = async (req: Request, res: Response) => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: validation.error.message });
    }
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      fullName,
    });

    const token = jwt.sign({ id: newUser._id }, config.jwtSecret, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.error("Error in register controller:", error);
  }
};
export const login = async (req: Request, res: Response) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: validation.error.message });
    }
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Lütfen tüm alanları doldurun" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "E-posta veya şifre yanlış" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "E-posta veya şifre yanlış" });
    }
    const token = jwt.sign({ id: user._id }, config.jwtSecret, {
      expiresIn: "7d",
    });
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.error("Error in login controller:", error);
  }
};
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.error("Error in getMe controller:", error);
  }
};
export const updatePreferences = async (req: AuthRequest, res: Response) => {
  try {
    const { targetLanguage, nativeLanguage } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Sadece gelen veriyi güncelle
    if (targetLanguage) user.preferences.targetLanguage = targetLanguage;
    if (nativeLanguage) user.preferences.nativeLanguage = nativeLanguage;

    await user.save();

    // Güncel kullanıcıyı dön (Password hariç)
    const updatedUser = await User.findById(userId).select("-password");
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Update failed" });
  }
};
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const resetToken = crypto.randomInt(100000, 999999).toString();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    console.log(`[RESET CODE] ${email} için kod: ${resetToken}`);

    res.json({
      message: "Doğrulama kodu e-posta adresinize gönderildi.",
      debugCode: resetToken,
    });
  } catch (error) {
    console.error("Error in forgotPassword controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const verifyResetCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({
      email,
      resetPasswordToken: code,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }
    res.json({ message: "Code verified successfully" });
  } catch (error) {
    console.error("Error in verifyResetCode controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({
      email,
      resetPasswordToken: code,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in resetPassword controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const upgradeToPremium = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isPremium: true },
      { new: true }
    ).select("-password");
    res.json({
      message: "Tebrikler! Premium üyelik aktif.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in upgradeToPremium controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: config.googleClientId,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ message: "Invalid token" });
    }
    const { email, name, sub } = payload;
    let user = await User.findOne({ email });
    if (!user) {
      const randomPassword = crypto.randomBytes(16).toString("hex");
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);
      user = await User.create({
        email,
        password: hashedPassword,
        fullName: name || "Google User",
        preferences: {
          targetLanguage: "English",
          nativeLanguage: "Turkish",
        },
      });
    }
    const token = jwt.sign(
      {
        id: user._id,
      },
      config.jwtSecret,
      {
        expiresIn: "7d",
      }
    );
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        preferences: user.preferences,
        isPremium: user.isPremium,
      },
    });
  } catch (error) {
    console.error("Error in googleLogin controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    await Session.deleteMany({ userId });
    await User.findByIdAndDelete(userId);
    res.json({
      message: "Hesap Başarıyla Silindi.",
    });
  } catch (error) {
    console.error("Error in deleteAccount controller: ", error);
    res.status(500).json({ message: "Hesap silinemedi." });
  }
};
export const updateAvatar = async (req: AuthRequest, res: Response) => {
  try {
    const { avatarId } = req.body;
    const userId = req.user._id;
    const user = await User.findByIdAndUpdate(
      userId,
      { avatarId: avatarId },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (error) {
    console.error("Error in deleteAccount controller: ", error);
    res.status(500).json({ message: "Hesap silinemedi." });
  }
};
export const claimQuestReward = async (req: AuthRequest, res: Response) => {
  try {
    const { questId } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    // İlgili görevi bul
    const quest = user.quests.daily.find((q) => q.id === questId);

    if (!quest) {
      return res.status(404).json({ message: "Görev bulunamadı." });
    }

    // Kontroller
    if (!quest.isCompleted) {
      return res.status(400).json({ message: "Görev henüz tamamlanmamış." });
    }
    if (quest.isClaimed) {
      return res.status(400).json({ message: "Ödül zaten alınmış." });
    }

    // Ödülü ver
    user.stats.xp += quest.xpReward;
    quest.isClaimed = true;

    await user.save();

    res.json({
      message: "Ödül alındı!",
      xpEarned: quest.xpReward,
      newXp: user.stats.xp,
      questId: quest.id,
    });
  } catch (error) {
    res.status(500).json({ message: "Ödül alınamadı." });
  }
};
export const updatePushToken = async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.body;
    await User.findByIdAndUpdate(req.user._id, { pushToken: token });
    res.json({ message: "Token güncellendi." });
  } catch (error) {
    res.status(500).json({ message: "Token hatası" });
  }
};
