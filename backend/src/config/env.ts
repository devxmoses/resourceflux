import {z} from "zod";
import dotenv from 'dotenv'

dotenv.config();


const envSchema = z.object({
    NODE_ENV:z.enum(['development', 'production']).default('development'),
    PORT:z.string().default('5000'),
    MONGO_URI: z.string(),
    ACCESS_TOKEN_SECRET: z.string().min(32),
    REFRESH_TOKEN_HASH_SECRET:z.string().min(32),
    JWT_EXPIRES_IN:z.string().default('900'),
    REFRESH_TOKEN_EXPIRES_IN_DAYS:z.string().default('7'),
    CLIENT_URL: z.url(),
    GOOGLE_CLIENT_ID:z.string().optional(),
    GOOGLE_CLIENT_SECRET:z.string().optional(),
    GOOGLE_CALLBACK_URL:z.string().optional(),
    RESEND_API_KEY:z.string(),
    EMAIL_FROM:z.email(),
});

const env = envSchema.parse(process.env)

export default env;