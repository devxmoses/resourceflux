import passport from 'passport'
import {Strategy as GoogleStrategy} from 'passport-google-oauth20'
import { HTTP_STATUS } from '../constants/http.js'
import { User } from '../models/user.js'
import appAssert from '../utils/appAssert.js';
import env from './env.js'

appAssert(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET,HTTP_STATUS.INTERNAL_SERVER_ERROR,'Internal Server Error');
passport.use(
    new GoogleStrategy(
        {
            clientID:env.GOOGLE_CLIENT_ID,
            clientSecret:env.GOOGLE_CLIENT_SECRET,
            callbackURL: env.GOOGLE_CALLBACK_URL,
        },
        async(_accessToken:string, _refreshToken:string, profile:any, done:any)=>{
            const email = profile.emails?.[0]?.value;
            if (!email) return done(new Error('No email found in Google profile'));
            let user = await User.findOne({googleId:profile.id});
            if(!user){
                const existingByEmail = await User.findOne({email});
                if(existingByEmail){
                    return done(null,false)
                }
                user = await User.create({name:profile.displayName,email,googleId:profile.id,isVerified:true,});
            }
            return done(null, user);            
        }      
    )
);

export default passport;