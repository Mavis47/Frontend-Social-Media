import type { Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config()

const generateToken = (userId: string) => {
    const token = jwt.sign({userId},process.env.JWT_SECRET!,{
        expiresIn: "30d"
    })

    return token;
}

export default generateToken;