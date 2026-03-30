import {Schema, model} from 'mongoose'
import bcrypt from 'bcrypt'
import type { IUser } from '../types/index.js'

const userSchema = new Schema<IUser>({
    name:{type:String, required:true},
    email:{type:String, required:true,unique:true, lowercase:true,trim:true},
    password:{type:String, select:false},
    googleId:{type:String, sparse:true},
    isVerified:{type:Boolean, default:false},
    verificationToken:{type:String},
    verificationTokenExpiry:{type:Date},
    resetToken:{type:String},
    resetTokenExpiry: {type:Date},
    role:{type:String, enum:['user','admin'], default:'user'},
},{timestamps:true});

userSchema.pre('save', async function(){
    if(!this.isModified('password') || !this.password) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidate:string):Promise<boolean>{
    if(!this.password) return false;
    return await bcrypt.compare(candidate, this.password);
}

export const User = model<IUser>('user',userSchema);