
import type { Request, Response, NextFunction } from 'express';
import  jwt, { type JwtPayload }  from 'jsonwebtoken';
import prisma from "../db/db";


interface DecodedToken extends JwtPayload{
    userId: number,
}

declare global {
    namespace Express {
        export interface Request {
            user: {
                id: number;
            }
        }
    }
}

export const protectRoutes = async(req: Request,res: Response,next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split?.(' ')?.at(1) as string;

        if(!token){
            return res.status(401).json({error: "Unauthorized - Login To Continue..."})
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET!) as DecodedToken;

        if(!decoded){
            return res.status(401).json({error: "Unauthorized - Invalid Token"})
        }

        const userId = Number(decoded.userId);

        const user = await prisma.user.findUnique({where: {id:userId}, select: {id: true,username: true,fullname: true, userProfilePic: true}})

        if(!user){
            return res.status(401).json({error: "User Not Found"})
        }

        req.user = user

        next()

    } catch (error) {
        console.log("Error in protect route",error)
        res.status(500).json({error: "Internal Server Error"})
    }
}