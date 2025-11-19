import mongoose from "mongoose"

export interface IUser extends mongoose.Document {
    email: string;
    password: string; // Hashlenmiş hali burada duracak
    fullName: string;
    preferences: {
      targetLanguage: string;
      nativeLanguage: string;
      difficultyLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
    };
    stats: {
      xp: number;
      streak: number;
      totalSessions: number;
    };
    savedWords: string[];
    createdAt: Date;
}
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    preferences: {
        targetLanguage: { type: String, default: 'English' }, // Varsayılan İngilizce
        nativeLanguage: { type: String, default: 'Turkish' }, // Varsayılan Türkçe
        difficultyLevel: { 
            type: String, 
            enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], // Sadece bunları kabul et
            default: 'A1' // Varsayılan Başlangıç
        },
    },
    
    stats: {
        xp: { type: Number, default: 0 },
        streak: { type: Number, default: 0 },
        totalSessions: { type: Number, default: 0 }}
},{
    timestamps: true,
})

export default mongoose.model<IUser>("User", userSchema);