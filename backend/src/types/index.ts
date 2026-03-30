import {Document, Types} from 'mongoose'
import type { Request } from 'express'

export interface IUser extends Document{
    name:string;
    email:string;
    password?:string;
    googleId?:string;
    isVerified:boolean;
    verificationToken?:string;
    verificationTokenExpiry?: Date;
    resetToken?:string;
    resetTokenExpiry?:Date;
    role:'user'|'admin';
    createdAt:Date;
    updatedAt:Date; 
    comparePassword(candidate:string):Promise<boolean>;
}

export interface IRefreshToken extends Document {
    token:string,
    userId: Types.ObjectId,
    expiresAt: Date,
    isRevoked:boolean;
}

export interface AuthRequest extends Request {
    user?: IUser;
}

export interface JwtPayload{
    userId:string;
    email:string;
}

export interface TokenPair{
    accessToken:string;
    refreshToken:string;
}
export interface RegisterInput{
    name:string,
    email:string,
    password:string,
}