import { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import Session from "../models/Session";
import fs from "fs";
import path from "path";
import {
  getChatCompletion,
  generateFeedbackAnalysis,
  transcribeAudioWithWhisper,
} from "../services/OpenAIService";
import User from "../models/User";
const isSameDay = (d1: Date, d2: Date) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

// Yardımcı Fonksiyon: İki tarih ardışık mı? (d1 = d2'den 1 gün sonra mı?)
const isConsecutiveDay = (d1: Date, d2: Date) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const diff = d1.setHours(0, 0, 0, 0) - d2.setHours(0, 0, 0, 0);
  return diff === oneDay;
};
export const startSession = async (req: AuthRequest, res: Response) => {
  try {
    const { scenario, role, difficultyLevel, roleDescription, targetLanguage } =
      req.body;
    const userId = req.user._id;
    const languageToSpeak =
      targetLanguage || req.user.preferences.targetLanguage || "English";
    const botJob = roleDescription || role;
    const systemMessageContent = `
      You are playing a roleplay game.
      
      YOUR CHARACTER:
      - Name: ${role}
      - Job/Role: ${botJob}
      - Context: ${scenario}
      
      THE USER:
      - Learning Level: ${difficultyLevel}
      - Target Language: ${languageToSpeak}
      
      RULES:
      1. You must ONLY speak in ${languageToSpeak}. Never speak another language unless the scenario specifically asks for translation.
      2. Act exactly like a real ${botJob}. Do not be an AI assistant. Be the character.
      3. Keep your responses concise (1-3 sentences) suitable for a chat app.
      4. Adjust your vocabulary complexity to match the user's level (${difficultyLevel}).
    `;
    const systemMessage = {
      role: "system",
      content: systemMessageContent,
    };

    const newSession = await Session.create({
      userId,
      scenario,
      role,
      difficultyLevel,
      messages: [systemMessage],
    });
    res.status(201).send(newSession);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.error("Error in startSession controller:", error);
  }
};
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId, message } = req.body;
    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user._id,
    });
    if (!session || session.status === "completed") {
      return res
        .status(404)
        .json({ message: "Session not found or completed" });
    }
    session.messages.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });
    const historyForAI = session.messages.map((msg) => ({
      role: msg.role as "system" | "user" | "assistant",
      content: msg.content,
    }));
    const aiResponse = await getChatCompletion(historyForAI);
    if (aiResponse) {
      session.messages.push({
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      });
    }
    await session.save();
    res.json({ reply: aiResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Message failed" });
  }
};
export const endSession = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user._id;
    const session = await Session.findOne({
      _id: sessionId,
      userId,
    });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    const feedback = await generateFeedbackAnalysis(session.messages);
    if (!feedback) {
      return res
        .status(500)
        .json({ message: "Failed to parse feedback from AI" });
    }
    const xpEarned = feedback.score || 0;
    const user = await User.findById(userId);
    const today = new Date();
    let newStreak = user?.stats.streak || 0;
    let lastDate = user?.stats.lastActivityDate
      ? new Date(user.stats.lastActivityDate)
      : null;
    if (lastDate) {
      if (isSameDay(today, lastDate)) {
      } else if (isConsecutiveDay(today, lastDate)) {
        // Dün yapmış, seriyi artır
        newStreak += 1;
      } else {
        // Seri bozulmuş, baştan başla
        newStreak = 1;
      }
    } else {
      // İlk defa yapıyor
      newStreak = 1;
    }
    await User.findByIdAndUpdate(userId, {
      $inc: {
        "stats.xp": xpEarned, // XP'yi artır
        "stats.totalSessions": 1, // Toplam oturumu 1 artır
      },
      $set: {
        "stats.streak": newStreak,
        "stats.lastActivityDate": today, // Son aktiviteyi güncelle (Streak için)
      },
      $push: {
        "stats.activityHistory": today,
      },
    });
    session.feedback = feedback;
    session.status = "completed";
    await session.save();
    res.json({
      ...feedback,
      xpEarned, // <-- Bunu ekledik
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate feedback" });
  }
};
export const getLastSession = async (req: AuthRequest, res: Response) => {
  try {
    const lastSession = await Session.findOne({
      userId: req.user._id,
      status: "active", // <-- KRİTİK NOKTA: Sadece aktifleri getir
    })
      .sort({ updatedAt: -1 })
      .limit(1);

    if (!lastSession) {
      return res.json(null);
    }

    res.json(lastSession);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch last session" });
  }
};
export const getSession = async (req: AuthRequest, res: Response) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch session" });
  }
};
// Mime type'dan dosya uzantısına mapping
const getExtensionFromMimeType = (mimeType: string): string => {
  const mimeToExt: { [key: string]: string } = {
    "audio/mp4": "m4a",
    "audio/x-m4a": "m4a",
    "audio/m4a": "m4a",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
    "audio/wave": "wav",
    "audio/webm": "webm",
    "audio/ogg": "ogg",
    "audio/oga": "oga",
    "audio/flac": "flac",
    "audio/mpeg3": "mp3",
    "audio/x-mpeg-3": "mp3",
  };

  // Mime type'dan uzantıyı bul
  if (mimeType && mimeToExt[mimeType]) {
    return mimeToExt[mimeType];
  }

  // Mime type'da "/" varsa ikinci kısmı al (audio/mp4 -> mp4)
  if (mimeType && mimeType.includes("/")) {
    const parts = mimeType.split("/");
    const ext = parts[1];
    // Eğer desteklenen formatlardan biri ise döndür
    const supportedFormats = [
      "flac",
      "m4a",
      "mp3",
      "mp4",
      "mpeg",
      "mpga",
      "oga",
      "ogg",
      "wav",
      "webm",
    ];
    if (supportedFormats.includes(ext)) {
      // mp4'ü m4a'ya çevir (Whisper ses için m4a tercih eder)
      return ext === "mp4" ? "m4a" : ext;
    }
  }

  // Varsayılan olarak m4a (en yaygın format)
  return "m4a";
};

export const transcribeAudio = async (req: any, res: Response) => {
  let newPath = ""; // Temizlik için dışarıda tanımladık

  try {
    if (!req.file) {
      return res.status(400).json({ message: "Ses dosyası yüklenmedi." });
    }

    const originalPath = req.file.path;
    const mimeType = req.file.mimetype || "audio/m4a";

    // 1. Mime type'dan doğru uzantıyı al
    const extension = getExtensionFromMimeType(mimeType);

    // 2. Dosyayı yeniden adlandır (Uzantı ekle)
    // Örn: uploads/12345 -> uploads/12345.m4a
    newPath = `${originalPath}.${extension}`;
    fs.renameSync(originalPath, newPath);

    // 3. Servisi Çağır (Artık uzantılı dosya gidiyor)
    const text = await transcribeAudioWithWhisper(newPath, extension);

    // 4. Temizlik
    if (fs.existsSync(newPath)) fs.unlinkSync(newPath);

    res.json({ text });
  } catch (error) {
    // Hata durumunda temizlik
    if (newPath && fs.existsSync(newPath)) fs.unlinkSync(newPath);
    else if (req.file && req.file.path && fs.existsSync(req.file.path))
      fs.unlinkSync(req.file.path);

    console.error("Transcribe Controller Error:", error);
    res.status(500).json({ message: "Ses işlenemedi." });
  }
};
