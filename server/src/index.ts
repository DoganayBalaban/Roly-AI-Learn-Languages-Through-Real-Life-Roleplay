import express from "express";
import { connectDB } from "./config/db";
import cors from "cors";
import userRoutes from "./routes/user.route";
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use("/api/users",userRoutes);

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
    connectDB();
})