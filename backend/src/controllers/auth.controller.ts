import type { Request, Response } from "express";
import { registerUser,loginUser, logoutUser, refreshUserToken, verifyUserEmail, forgotUserPassword, resetUserPassword, issueTokensForOAuthUser, logoutAllSessions } from "../services/auth.service.js";
import { resendVerificationEmail } from "../services/email.service.js";
import env from "../config/env.js";
import type { IUser, RegisterInput} from "../types/index.js";
import appAssert from "../utils/appAssert.js";
import { HTTP_STATUS } from "../constants/http.js";

const ACCESS_TOKEN_EXPIRES_MS = parseInt(env.JWT_EXPIRES_IN)*1000;
const REFRESH_EXPIRES_MS = parseInt(env.REFRESH_TOKEN_EXPIRES_IN_DAYS)*24*60*60*1000;
const COOKIE_OPTIONS = {
   httpOnly:true,
   secure: env.NODE_ENV === 'production',
   sameSite: 'strict' as const, 
}
function setTokenCookies(res:Response, accessToken:string, refreshToken:string):void{
   res.cookie('accessToken', accessToken, {...COOKIE_OPTIONS, maxAge:ACCESS_TOKEN_EXPIRES_MS});
   res.cookie('refreshToken', refreshToken, {...COOKIE_OPTIONS, maxAge: REFRESH_EXPIRES_MS});
}

function clearTokenCookies(res:Response):void{
   res.clearCookie('accessToken', COOKIE_OPTIONS);
   res.clearCookie('refreshToken', COOKIE_OPTIONS);
}
export async function register(req:Request,res:Response):Promise<void>{
   await registerUser(req.body as RegisterInput);
   res.status(201).json({message:'Registration successful. Please check your email to verify your account.'});
}

export async function login(req:Request, res:Response):Promise<void>{
   const {email,password} = req.body;
   const {accessToken,refreshToken,user} = await loginUser(email,password);
   setTokenCookies(res, accessToken, refreshToken);
   res.json({user});
}

export async function logout(req:Request, res:Response):Promise<void>{
   await logoutUser(req.cookies?.refreshToken as string | undefined);
   clearTokenCookies(res);
   res.json({message:'Logged out'});
}

export async function logoutAll(req:Request, res:Response):Promise<void>{
   const user = req.user as IUser;
   await logoutAllSessions(user._id.toString());
   clearTokenCookies(res);
   res.json({message:'Logged out from all devices'});
}
//explain this below function in claude especially the complex sides
export async function refreshToken(req:Request, res:Response):Promise<void>{
   const rawRefresh = req.cookies?.refreshToken as string | undefined;
   appAssert(rawRefresh, HTTP_STATUS.UNAUTHORIZED, 'No refresh token');
   const {accessToken, refreshToken:newRefresh} = await refreshUserToken(rawRefresh,req.cookies?.accessToken);
   setTokenCookies(res, accessToken, newRefresh);
   res.json({message:'Token refreshed'});
}

export async function resendVerification(req:Request,res:Response):Promise<void>{
   const {email} = req.body as {email:string};
   await resendVerificationEmail(email);
   res.json({message:'If that email exists and is unverified, a new link has been sent.'});
}
export async function verifyEmail(req:Request, res:Response){
   const {token} = req.query as {token:string};
   await verifyUserEmail(token);
   res.json({message:'Email verified successfully. You can now log in.'})
}

//explain req.body vs req.query used above
export async function forgotPassword(req:Request, res:Response):Promise<void>{
   const {email} = req.body as {email:string};
   await forgotUserPassword(email);
   res.json({message:'A reset link has been sent'});
}

export async function resetPassword(req:Request, res:Response):Promise<void>{
   const {token, password} = req.body as {token:string, password:string};
   await resetUserPassword(token, password);
   res.json({message:'Password reset successfully. You can now log in'});
}

export function getMe(req:Request, res:Response):void{
   const user = req.user as IUser;
   res.json({user:{id:user._id, name:user.name, email:user.email, isVerified:user.isVerified}})
}

export async function googleCallBack(req:Request, res:Response):Promise<void>{
   const user = req.user as IUser;
   const {accessToken, refreshToken} = await issueTokensForOAuthUser(user);
   setTokenCookies(res, accessToken, refreshToken);
   res.redirect(`${env.CLIENT_URL}/dashboard`);
}