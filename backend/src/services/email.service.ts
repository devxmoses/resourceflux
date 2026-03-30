import { Resend } from 'resend';
import env from '../config/env.js'
import { HTTP_STATUS } from '../constants/http.js';
import appAssert from '../utils/appAssert.js';
import { User } from '../models/user.js';
import crypto from 'crypto'

const resend = new Resend(env.RESEND_API_KEY);

export async function sendVerificationEmail(to:string, token:string): Promise<void>{
    const url=`${env.CLIENT_URL}/verify-email?token=${token}`;
    const {error}=await resend.emails.send({
        from:env.EMAIL_FROM,
        to,
        subject:'Verify your email address',
        html: `
            <h1>Welcome!</h1>
            <p>Click to verify your email address. This link expires in 24 hours </p>
            <a href="${url}">
                Verify Email
            </a>
            <p>Or copy and paste this link:<a href="${url}">${url}</a></p>
        `,
    });
    appAssert(!error, HTTP_STATUS.BAD_GATEWAY, error?.message ?? 'Failed to send verification email');
}

export async function resendVerificationEmail(email:string):Promise<void>{
    const user = await User.findOne({email});
    if(!user || user.isVerified) return;
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry= new Date(Date.now() + 24*60*60*1000)
    user.verificationToken = verificationToken;
    user.verificationTokenExpiry=verificationTokenExpiry;
    await user.save();
    await sendVerificationEmail(email, verificationToken);
}

export async function sendPasswordResetMail(to:string, name:string, token:string):Promise<void>{
     const {error}=await resend.emails.send({
        from:env.EMAIL_FROM,
        to,
        subject:'Reset your password',
        html: `
            <h1>Hi ${name},</h1>
            <p>Click below to reset your password. This link expires in 1 hour.</p>
            <a href="${env.CLIENT_URL}/reset-password?token=${token}">
                Reset Password
            </a>
            <p>If you didn't request this, ignore this email.</p>
        `,
    });
    appAssert(!error, HTTP_STATUS.BAD_GATEWAY, error?.message ?? 'Failed to send password reset email');
    //appAssert has a positive condition to be met as the first argument if not it asserts error, so the positive argument here is !error
}
