import type { Request, Response } from "express";

export const register = (async(_:Request,res:Response)=>{
    return res.status(200).json({
        message:"registered"
    })
});

export const login = (async()=>{

});