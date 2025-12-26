import mongoose, { Document, Schema } from "mongoose";

// Kelime Defteri için detaylı yapı
interface ISavedWord {
  word: string;
  translation: string; // Türkçe anlamı
  contextSentence?: string; // Hangi cümlede geçti?
  savedAt: Date;
}
interface IQuest {
  id: string;
  type: "SESSION_COMPLETE" | "WORD_SAVE" | "VOICE_USE";
  description: string;
  target: number; // Hedef (Örn: 3 kelime)
  progress: number; // Şu anki (Örn: 1 kelime)
  isCompleted: boolean;
  isClaimed: boolean; // Ödül alındı mı?
  xpReward: number;
}
export interface IUser extends Document {
  email: string;
  password: string;
  fullName: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  pushToken?: string;
  isPremium: boolean;
  avatarId: string;
  preferences: {
    targetLanguage: string;
    nativeLanguage: string;
    difficultyLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  };
  stats: {
    xp: number;
    weeklyXp: number; // Haftalık XP
    streak: number;
    totalSessions: number;
    lastActivityDate?: Date; // <--- YENİ: Seriyi (Streak) hesaplamak için şart
    activityHistory: Date[];
    lastWeeklyReset?: Date; // Haftalık XP sıfırlama tarihi
  };
  savedWords: ISavedWord[]; // <--- GÜNCELLENDİ: Sadece string değil, obje tutacak
  createdAt: Date;
  quests: {
    lastResetDate: Date;
    daily: IQuest[];
  };
}

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    avatarId: {
      type: String,
      default: "",
    },
    pushToken: { type: String, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    isPremium: { type: Boolean, default: false },
    preferences: {
      targetLanguage: { type: String, default: "English" },
      nativeLanguage: { type: String, default: "Turkish" },
      difficultyLevel: {
        type: String,
        enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
        default: "A1",
      },
    },

    stats: {
      xp: { type: Number, default: 0 },
      weeklyXp: { type: Number, default: 0 },
      streak: { type: Number, default: 0 },
      totalSessions: { type: Number, default: 0 },
      lastActivityDate: { type: Date, default: null },
      activityHistory: [{ type: Date }],
      lastWeeklyReset: { type: Date, default: null },
    },

    savedWords: [
      {
        word: { type: String, required: true },
        translation: { type: String, required: true },
        contextSentence: { type: String },
        savedAt: { type: Date, default: Date.now },
      },
    ],
    quests: {
      lastResetDate: { type: Date, default: Date.now },
      daily: [
        {
          id: String,
          type: {
            type: String,
            enum: ["SESSION_COMPLETE", "WORD_SAVE", "VOICE_USE"],
          },
          description: String,
          target: Number,
          progress: { type: Number, default: 0 },
          isCompleted: { type: Boolean, default: false },
          isClaimed: { type: Boolean, default: false },
          xpReward: Number,
        },
      ],
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
