import type { NextFunction, Request, Response } from "express";
import appAssert from "../utils/appAssert.js";
import { verifyAccessToken } from "../services/token.service.js";
import { HTTP_STATUS } from "../constants/http.js";
import { User } from "../models/user.js";

export async function authenticate(req:Request, res:Response, next:NextFunction):Promise<void>{
    const token=req.cookies?.accessToken as string | undefined;
    appAssert(token,HTTP_STATUS.UNAUTHORIZED,'Not Authenticated')
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.userId);
    appAssert(user,HTTP_STATUS.UNAUTHORIZED,'User not found')
    req.user = user;
    next();
}