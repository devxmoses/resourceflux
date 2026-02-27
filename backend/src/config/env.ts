import {z} from "zod";
import dotenv from 'dotenv'

dotenv.config();


const envSchema = z.object({
    NODE_ENV:z.enum(['development', 'production']).default('development'),
    PORT:z.string().default('5000'),
    MONGO_URI: z.string(),
    ACCESS_TOKEN_SECRET: z.string().min(32),
    REFRESH_TOKEN_SECRET:z.string().min(32),
    CLIENT_URL: z.string(),
    GOOGLE_CLIENT_ID:z.string().optional(),
    GOOGLE_CLIENT_SECRET:z.string().optional(),
    GOOGLE_CALLBACK_URL:z.string().optional(),
    SMTP_HOST:z.string(),
    SMTP_PORT:z.string().default('587'),
    SMTP_USER:z.string(),
    SMTP_PASS:z.string(),
    EMAIL_FROM:z.string(),
});

const env = envSchema.parse(process.env)

export default env;