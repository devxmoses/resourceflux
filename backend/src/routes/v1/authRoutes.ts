import { Router } from "express"
import passport from "../../config/passport.js";
import {
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    refreshToken,
    getMe,
    googleCallBack,
    logoutAll,
    resendVerification,
} from "../../controllers/auth.controller.js"
import z from "zod";
import { authRateLimiter } from "../../middlewares/rateLimiter.js";
import { validate } from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { dashboard } from "../../controllers/admin.controller.js";
import env from "../../config/env.js";

const router = Router();

const registerSchema = z.object({
    name: z.string().min(2).max(50),
    email:z.email(),
    password:z.string().min(8).max(50),
});

const loginSchema = z.object({
    email:z.email(),
    password:z.string().min(8).max(50),
});

const resendVerificationSchema=z.object({
    email:z.email(),
})

const forgotSchema = z.object({
    email:z.email(),
});

const resetSchema = z.object({
    token: z.string().min(1),
    password:z.string().min(8).max(50),
});
router.post('/register',authRateLimiter, validate(registerSchema), register);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', authRateLimiter, validate(resendVerificationSchema),resendVerification);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/logout',logout);
router.post('/logout-all', authenticate, logoutAll)
router.post('/refresh', authRateLimiter, refreshToken)
router.post('/forgot-password',authRateLimiter, validate(forgotSchema), forgotPassword);
router.post('/reset-password', authRateLimiter, validate(resetSchema), resetPassword);
router.get('/me', authenticate, getMe);

//Google OAuth
router.get('/google', passport.authenticate('google',{scope:['profile','email'], session:false}))
router.get('/google/callback', passport.authenticate('google',{session:false, failureRedirect:`${env.CLIENT_URL}/login`}),googleCallBack);

//Admin Route
router.get('/admin/dashboard', authenticate, authorize('admin'), dashboard);
export default router;