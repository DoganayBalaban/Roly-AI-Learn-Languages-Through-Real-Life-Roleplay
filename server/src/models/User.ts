import mongoose, { Schema, Document } from 'mongoose';

// Kelime Defteri için detaylı yapı
interface ISavedWord {
  word: string;
  translation: string; // Türkçe anlamı
  contextSentence?: string; // Hangi cümlede geçti?
  savedAt: Date;
}

export interface IUser extends Document {
  email: string;
  password: string;
  fullName: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  isPremium: boolean;
  preferences: {
    targetLanguage: string;
    nativeLanguage: string;
    difficultyLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  };
  stats: {
    xp: number;
    streak: number;
    totalSessions: number;
    lastActivityDate?: Date; // <--- YENİ: Seriyi (Streak) hesaplamak için şart
  };
  savedWords: ISavedWord[]; // <--- GÜNCELLENDİ: Sadece string değil, obje tutacak
  createdAt: Date;
}

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  isPremium: { type: Boolean, default: false },
  preferences: {
    targetLanguage: { type: String, default: 'English' },
    nativeLanguage: { type: String, default: 'Turkish' },
    difficultyLevel: { 
      type: String, 
      enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], 
      default: 'A1' 
    },
  },

  stats: {
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
    lastActivityDate: { type: Date, default: null }
  },

  savedWords: [{
    word: { type: String, required: true },
    translation: { type: String, required: true },
    contextSentence: { type: String },
    savedAt: { type: Date, default: Date.now }
  }]

}, { timestamps: true });

export default mongoose.model<IUser>("User", userSchema);