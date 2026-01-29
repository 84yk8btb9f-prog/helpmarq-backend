import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import rateLimit from 'express-rate-limit';
import auth from './config/auth.js';
import mongoose from 'mongoose';
import { startCronJobs } from './services/cronJobs.js';
import { toNodeHandler } from "better-auth/node";

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Connect to MongoDB FIRST
await connectDB();

// Wait for MongoDB connection
await new Promise((resolve) => {
    if (mongoose.connection.readyState === 1) {
        resolve();
    } else {
        mongoose.connection.once('open', resolve);
    }
});

console.log('✓ MongoDB connection ready');

// ✅ FIXED: CORS configuration with proper production URLs
const corsOptions = {
    origin: NODE_ENV === 'production' 
        ? ['https://helpmarq-frontend.vercel.app', 'https://www.sapavault.com', 'https://sapavault.com']
        : ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: 'Too many requests, please try again later.'
});

app.use('/api/', limiter);

// Request logging in development
if (NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
        next();
    });
}

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        environment: NODE_ENV,
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// ✅ FIXED: Root route - critical for Render deployment
app.get('/', (req, res) => {
    res.json({
        message: 'HelpMarq API - Expert insights. Accessible pricing.',
        version: '2.0',
        status: 'Running',
        environment: NODE_ENV,
        endpoints: {
            health: '/health',
            api: '/api'
        }
    });
});

// Better Auth
app.use('/api/auth/', toNodeHandler(auth));

// Import routes
import authRouter from './routes/auth.js';
import projectsRouter from './routes/projects.js';
import reviewersRouter from './routes/reviewers.js';
import applicationsRouter from './routes/applications.js';
import feedbackRouter from './routes/feedback.js';
import statsRouter from './routes/stats.js';
import notificationsRouter from './routes/notifications.js';

// Mount API routes
app.use('/api/user', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/reviewers', reviewersRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/stats', statsRouter);
app.use('/api/notifications', notificationsRouter);

// OTP verification endpoint
app.post('/api/verify-otp', async (req, res) => {
    try {
        const { email, code } = req.body;
        
        if (!email || !code) {
            return res.status(400).json({
                success: false,
                error: 'Email and code required'
            });
        }
        
        const OTP = (await import('./models/OTP.js')).default;
        
        const otpRecord = await OTP.findOne({
            email: email.toLowerCase(),
            code: code,
            verified: false,
            expiresAt: { $gt: new Date() }
        });
        
        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired code'
            });
        }
        
        otpRecord.verified = true;
        await otpRecord.save();
        
        await mongoose.connection.db.collection('user').updateOne(
            { email: email.toLowerCase() },
            { $set: { emailVerified: true } }
        );
        
        console.log('✅ Email verified:', email);
        
        res.json({
            success: true,
            message: 'Email verified successfully'
        });
        
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.path
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    const message = NODE_ENV === 'production' 
        ? 'Internal server error'
        : err.message;
    
    res.status(500).json({
        success: false,
        error: message
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 HelpMarq API running on port ${PORT}`);
    console.log(`📊 Environment: ${NODE_ENV}`);
    console.log(`🔐 Better Auth configured`);
    console.log(`🌐 CORS origins:`, corsOptions.origin);
    
    // Start cron jobs
    import('./services/cronJobs.js').then(({ startCronJobs }) => {
        startCronJobs();
    });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await mongoose.connection.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await mongoose.connection.close();
    process.exit(0);
});