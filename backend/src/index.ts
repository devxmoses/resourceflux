import express from "express";
import helmet from "helmet";
import cors from "cors"
import cookieParser from "cookie-parser";
import env from './config/env.js';
import authRoutes from "./routes/v1/authRoutes.js"
import { errorHandler } from "./middlewares/errorHandler.js";
import { connectDB } from "./config/db.js";
import './config/passport.js'
import passport from "passport";

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(helmet());
app.use(cors({origin:env.CLIENT_URL, credentials:true}))
app.use(cookieParser())
app.use(passport.initialize());
app.use("/auth",authRoutes);
app.use(errorHandler);

app.get("/",(_,res)=>{
    return res.status(200).json({
        status:"healthy",
    })
})

connectDB().then(()=>{
    app.listen(env.PORT, ()=>{
        console.log(`Server is running on port ${env.PORT}`);
    });
});
