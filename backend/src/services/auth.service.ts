import crypto from "crypto";
import { User } from "../models/user.js";
import { HTTP_STATUS } from "../constants/http.js";
import appAssert from "../utils/appAssert.js";
import { sendPasswordResetMail, sendVerificationEmail } from "./email.service.js";
import type { IUser, RegisterInput } from "../types/index.js";
import { decodeExpiredAccessToken, deleteAllRefreshTokens, generateTokenPair, hashToken, revokeRefreshToken, rotateRefreshToken, signAccessToken } from "./token.service.js";


export async function registerUser(data:RegisterInput):Promise<void>{
    const existing = await User.findOne({email:data.email});
    appAssert(!existing, HTTP_STATUS.CONFLICT, 'User Exists');
    const verificationToken=crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now()+24*60*60*1000);
    await User.create({...data,verificationToken,verificationTokenExpiry });
    await sendVerificationEmail(data.email,verificationToken);
}

export async function loginUser(email:string,password:string):Promise<{accessToken:string, refreshToken:string; user:{id:unknown; email:string; name:string}}>{
    const user = await User.findOne({email}).select('+password');
    appAssert(user,HTTP_STATUS.UNAUTHORIZED,'Invalid email or password');
    const passwordMatch=await user.comparePassword(password)
    appAssert(passwordMatch,HTTP_STATUS.UNAUTHORIZED,'Invalid email or password');
    appAssert(user.isVerified,HTTP_STATUS.FORBIDDEN,'Please verify your email before logging in');
    const {accessToken, refreshToken } = await generateTokenPair(user._id,user.email);
    return {accessToken, refreshToken, user:{id:user._id, name:user.name, email:user.email}};
}

export async function logoutUser(rawRefreshToken:string|undefined):Promise<void>{
    if(rawRefreshToken) await revokeRefreshToken(rawRefreshToken);
}

export async function logoutAllSessions(userId:string):Promise<void>{
    await deleteAllRefreshTokens(userId);
}

export async function refreshUserToken(rawRefreshToken:string, accessTokenCookie:string|undefined):Promise<{accessToken:string, refreshToken:string}>{
    let userId:string;
    const payload = accessTokenCookie ? decodeExpiredAccessToken(accessTokenCookie ?? '') : null;
    appAssert(payload?.userId,HTTP_STATUS.UNAUTHORIZED, 'Cannot identify user from token');
    userId=payload.userId;
    const user = await User.findById(userId);
    appAssert(user,HTTP_STATUS.UNAUTHORIZED, 'User not found');

    const newRefreshToken = await rotateRefreshToken(rawRefreshToken, user._id);
    const accessToken = signAccessToken(user._id.toString(), user.email);

    return {accessToken, refreshToken: newRefreshToken}
}

export async function verifyUserEmail(token:string):Promise<void>{
    const user = await User.findOne({verificationToken:token, verificationTokenExpiry:{$gt:new Date() } });
    appAssert(user,HTTP_STATUS.UNAUTHORIZED,'Invalid or expired verification token');

    user.isVerified = true;
    await user.save();
    await User.updateOne({_id:user._id},{ $unset: {verificationToken:'',verificationTokenExpiry:''} });
}

export async function forgotUserPassword(email:string):Promise<void>{
    const user = await User.findOne({email});
    if(user){
        const rawResetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = hashToken(rawResetToken);
        user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();
        await sendPasswordResetMail(email, user.name, rawResetToken);
    }
}
export async function resetUserPassword(token:string, password:string):Promise<void>{
    const user = await User.findOne({resetToken:hashToken(token),resetTokenExpiry: { $gt: new Date() } });
    appAssert(user,HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired reset token');
    user.password=password;
    await user.save();
    await User.updateOne({_id:user._id}, { $unset: {resetToken:'', resetTokenExpiry:''}});
    await deleteAllRefreshTokens(user._id.toString());
}

export async function issueTokensForOAuthUser(user:IUser):Promise<{accessToken:string;refreshToken:string}>{
    return generateTokenPair(user._id, user.email);
}

