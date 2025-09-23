import express from 'express'
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './DB/connectDB.js'
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
app.use(cookieParser());
app.use(cors());
const PORT= process.env.PORT ||4000
connectDB();
app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
});


