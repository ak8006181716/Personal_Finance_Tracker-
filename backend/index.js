import express from 'express'
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './DB/connectDB.js'
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user.route.js';
import expenceRoutes from './routes/expence.route.js';
import budgetRoutes from './routes/budget.route.js';
import ApiError from './utils/ApiError.js';

dotenv.config();

const app = express();

// CORS configuration (allow frontend origin with credentials for cookies)
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization']
}));

app.use(cookieParser());
app.use(express.json());
const PORT= process.env.PORT ||4000
connectDB();
app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
});


// Middleware to parse JSON bodies




// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/expences', expenceRoutes);
app.use('/api/budgets', budgetRoutes);

// Default route


// Centralized error handler
app.use((err, req, res, next) => {
    // Known application errors
    if (err instanceof ApiError) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Internal server error',
            errors: err.errors || []
        });
    }

    // Unknown/unexpected errors
    const status = err.status || 500;
    const isProd = process.env.NODE_ENV === 'production';
    return res.status(status).json({
        success: false,
        message: isProd ? 'Internal server error' : (err.message || 'Internal server error'),
        stack: isProd ? undefined : err.stack
    });
});
