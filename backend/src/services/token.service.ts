import crypto from 'crypto'
import jwt from "jsonwebtoken"
import type { JwtPayload, TokenPair } from "../types/index.js"
import env from "../config/env.js";
import type { Types } from "mongoose";
import { RefreshToken } from '../models/refreshToken.js';
import { AppError } from '../utils/errors.js';

export function hashToken(token:string):string{
    return crypto.createHmac('sha256',env.REFRESH_TOKEN_HASH_SECRET).update(token).digest('hex');
}
export function signAccessToken(userId:string, email:string):string{
    return jwt.sign({userId, email} satisfies JwtPayload, env.ACCESS_TOKEN_SECRET,{
        expiresIn:parseInt(env.JWT_EXPIRES_IN),
    });
}

export function verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as JwtPayload;
}

export function decodeExpiredAccessToken(token:string): JwtPayload {
    return jwt.verify(token, env.ACCESS_TOKEN_SECRET,{ignoreExpiration:true, }) as JwtPayload;
}
export async function createRefreshToken(userId:Types.ObjectId):Promise<string>{
    const raw = crypto.randomBytes(64).toString('hex');
    const hashed = hashToken(raw);
    const expiresAt = new Date(Date.now() +  (parseInt(env.REFRESH_TOKEN_EXPIRES_IN_DAYS)*24*60*60*1000));
    await RefreshToken.create({token:hashed, userId, expiresAt});
    return raw;
}

export async function rotateRefreshToken(rawToken:string, userId: Types.ObjectId):Promise<string>{
    const hashed=hashToken(rawToken);
    const existing = await RefreshToken.findOne({token:hashed, userId, isRevoked:false});
    if(!existing || existing.expiresAt< new Date()){
        await RefreshToken.updateMany({userId},{isRevoked:true});
        throw new AppError(401,'Invalid or expired refresh token');
    }

    existing.isRevoked = true;
    await existing.save();
    
    return createRefreshToken(userId);
}

export async function revokeRefreshToken(rawToken:string):Promise<void>{
    const hashed = hashToken(rawToken);
    await RefreshToken.findOneAndUpdate({token:hashed},{isRevoked:true});
}

export async function deleteAllRefreshTokens(userId:string):Promise<void>{
    await RefreshToken.deleteMany({userId});
}

export async function generateTokenPair(userId:Types.ObjectId, email:string):Promise<TokenPair>{
    const accessToken = signAccessToken(userId.toString(),email);
    const refreshToken = await createRefreshToken(userId);
    return {accessToken, refreshToken};
}