import type { NextFunction, Request, Response } from "express";
import type { IUser } from "../types/index.js";
import appAssert from "../utils/appAssert.js";
import { HTTP_STATUS } from "../constants/http.js";

export function authorize(...roles:string[]){
    return (req:Request, res:Response, next:NextFunction):void => {
        const user = req.user as IUser;
        appAssert(user, HTTP_STATUS.UNAUTHORIZED,'Not authenticated');
        appAssert(roles.includes(user.role), HTTP_STATUS.FORBIDDEN,'Insufficient permissions');
        next();
    };

}