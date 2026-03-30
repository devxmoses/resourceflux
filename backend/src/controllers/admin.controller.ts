import type { Request, Response } from "express";
import { User } from "../models/user.js";

export async function dashboard(_req:Request,res:Response){
    const totalUsers = await User.countDocuments({});
    res.json({totalUsers});
}
