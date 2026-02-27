import express from "express";
import helmet from "helmet";
import cors from "cors"
import cookieParser from "cookie-parser";
import env from './config/env.js';
import authRoutes from "./routes/authRoutes.js"

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(helmet());

app.use(cors({origin:env.CLIENT_URL, credentials:true}))
app.use(cookieParser())


app.get("/",(_,res)=>{
    return res.status(200).json({
        status:"healthy",
    })
})
app.use("/auth",authRoutes);
app.listen(env.PORT, ()=>{
    console.log(`Server is running on port ${env.PORT}`);
});