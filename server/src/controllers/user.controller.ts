import { Request,Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config()

export const register = async(req:Request,res:Response)=>{
    try {
        const { email, password, fullName } = req.body;

    if(!email || !password || !fullName){
        return res.status(400).json({message:"All fields are required"})
    }
    const user = await User.findOne({email})
    if (user) {
        return res.status(400).json({message:"User already exists"})
    }
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password,salt)

    const newUser = await User.create({
        email,
        password:hashedPassword,
        fullName,
    })

    await newUser.save()

    const token = jwt.sign({id:newUser._id},process.env.JWT_SECRET!,{expiresIn:"7d"})

    res.status(201).json({
        message:"User created successfully",
        token,
        user:
        {
            id:newUser._id,
            email:newUser.email,
            fullName:newUser.fullName,
        }
    })
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.error("Error in register controller:",error)
    }
}