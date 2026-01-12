import mongoose from "mongoose";
import { config } from "./env";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.mongodbUri);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}
