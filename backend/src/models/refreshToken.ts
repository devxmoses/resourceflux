import { model, Schema } from "mongoose"
import type { IRefreshToken } from "../types/index.js"

const refreshTokenSchema = new Schema<IRefreshToken>({
    token: {type:String, required:true, index:true},
    userId:{type:Schema.Types.ObjectId, ref:'User', required:true},
    expiresAt: {type: Date, required:true},
    isRevoked: {type:Boolean, default:false},
});

refreshTokenSchema.index({ expiresAt: 1}, {expireAfterSeconds: 0})

export const RefreshToken = model<IRefreshToken>('RefreshToken', refreshTokenSchema);

