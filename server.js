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

const PORT = process.env.PORT || 10000;
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log('🚀 Starting HelpMarq server...');
console.log('📊 Environment:', NODE_ENV);
console.log('🔌 Port:', PORT);
console.log('🌐 Frontend URL:', process.env.FRONTEND_URL);
console.log('🔐 Auth Secret:', process.env.BETTER_AUTH_SECRET ? '✓ Set' : '✗ Missing');
console.log('📧 Resend Key:', process.env.RESEND_API_KEY ? '✓ Set' : '✗ Missing');
console.log('🗄️ MongoDB URI:', process.env.MONGODB_URI ? '✓ Set' : '✗ Missing');

// ✅ CRITICAL FIX: Enhanced CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = NODE_ENV === 'production' 
            ? [
                'https://helpmarq-frontend.vercel.app',
                'https://helpmarq-frontend.vercel.app/',
                /\\.vercel\\.app$/  // Allow all Vercel preview deployments
              ]
            : [
                'http://localhost:8080',
                'http://127.0.0.1:8080',
                'http://localhost:5173',
                'http://127.0.0.1:5173'
              ];
        
        // Check if origin matches any allowed origin
        const isAllowed = allowedOrigins.some(allowed => {
            if (typeof allowed === 'string') {
                return allowed === origin || allowed === origin + '/';
            } else if (allowed instanceof RegExp) {
                return allowed.test(origin);
            }
            return false;
        });
        
        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn('⚠️ Blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Set-Cookie'],
    exposedHeaders: ['set-cookie'],
    maxAge: 86400,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ Enhanced request logging
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    
    if (NODE_ENV === 'development') {
        console.log('  Origin:', req.headers.origin);
        console.log('  Cookies:', req.headers.cookie ? '✓ Present' : '✗ None');
    }
    
    next();
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => NODE_ENV === 'development' // Skip rate limiting in dev
});

app.use('/api/', limiter);

// ✅ Enhanced health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        environment: NODE_ENV,
        port: PORT,
        timestamp: new Date().toISOString(),
        mongodb: {
            status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            host: mongoose.connection.host || 'not connected'
        },
        config: {
            frontendUrl: process.env.FRONTEND_URL,
            authSecretSet: !!process.env.BETTER_AUTH_SECRET,
            resendKeySet: !!process.env.RESEND_API_KEY,
            mongoUriSet: !!process.env.MONGODB_URI
        },
        cors: {
            enabled: true,
            allowedOrigins: NODE_ENV === 'production' 
                ? ['https://helpmarq-frontend.vercel.app']
                : ['http://localhost:8080', 'http://localhost:5173']
        }
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'HelpMarq API - Expert insights. Accessible pricing.',
        version: '2.0',
        status: 'Running',
        environment: NODE_ENV,
        endpoints: {
            health: '/health',
            auth: '/api/auth/*',
            projects: '/api/projects',
            reviewers: '/api/reviewers',
            applications: '/api/applications',
            feedback: '/api/feedback',
            stats: '/api/stats',
            notifications: '/api/notifications',
            user: '/api/user/*'
        }
    });
});

// ✅ Mount Better Auth with error handling
try {
    app.use('/api/auth/', toNodeHandler(auth));
    console.log('✅ Better Auth mounted at /api/auth/');
} catch (error) {
    console.error('❌ Failed to mount Better Auth:', error);
    process.exit(1);
}

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
        console.error('❌ OTP verification error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ✅ Enhanced 404 handler
app.use((req, res) => {
    console.log('❌ 404:', req.method, req.path);
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.path,
        method: req.method
    });
});

// ✅ Enhanced error handler with detailed logging
app.use((err, req, res, next) => {
    console.error('❌ =============== ERROR ===============');
    console.error('Path:', req.path);
    console.error('Method:', req.method);
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    console.error('======================================');
    
    const message = NODE_ENV === 'production' 
        ? 'Internal server error'
        : err.message;
    
    res.status(err.status || 500).json({
        success: false,
        error: message,
        ...(NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ✅ Proper startup sequence
async function startServer() {
    try {
        console.log('1️⃣ Validating environment variables...');
        
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is required');
        }
        
        if (!process.env.BETTER_AUTH_SECRET) {
            throw new Error('BETTER_AUTH_SECRET is required');
        }
        
        if (!process.env.RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY is required');
        }
        
        console.log('✅ Environment variables validated');
        
        console.log('2️⃣ Connecting to MongoDB...');
        await connectDB();
        
        console.log('3️⃣ Waiting for MongoDB connection...');
        await new Promise((resolve, reject) => {
            if (mongoose.connection.readyState === 1) {
                resolve();
            } else {
                mongoose.connection.once('open', resolve);
                mongoose.connection.once('error', reject);
                
                // Timeout after 30 seconds
                setTimeout(() => reject(new Error('MongoDB connection timeout')), 30000);
            }
        });
        
        console.log('✅ MongoDB ready');
        console.log('   Database:', mongoose.connection.db.databaseName);
        console.log('   Host:', mongoose.connection.host);
        
        console.log('4️⃣ Starting HTTP server...');
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log('');
            console.log('🎉 =======================================');
            console.log('🚀 HelpMarq API is LIVE!');
            console.log('📊 Environment:', NODE_ENV);
            console.log('🔌 Port:', PORT);
            console.log('🌐 Base URL:', NODE_ENV === 'production' 
                ? 'https://helpmarq-backend.onrender.com'
                : `http://localhost:${PORT}`);
            console.log('🔐 Auth endpoint:', '/api/auth/*');
            console.log('🗄️ MongoDB:', mongoose.connection.db.databaseName);
            console.log('🍪 CORS enabled for:', NODE_ENV === 'production'
                ? 'https://helpmarq-frontend.vercel.app'
                : 'http://localhost:8080');
            console.log('=======================================');
            console.log('');
            
            console.log('5️⃣ Starting cron jobs...');
            startCronJobs();
            console.log('✅ Cron jobs started');
            console.log('');
            console.log('✓ Server fully initialized and ready for requests');
        });
        
        // Handle server errors
        server.on('error', (error) => {
            console.error('❌ Server error:', error);
            process.exit(1);
        });
        
    } catch (error) {
        console.error('❌ =============== STARTUP FAILED ===============');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        console.error('================================================');
        process.exit(1);
    }
}

startServer();

// ✅ Graceful shutdown
const shutdown = async (signal) => {
    console.log(`\\n${signal} received, shutting down gracefully...`);
    
    try {
        await mongoose.connection.close();
        console.log('✓ MongoDB connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ✅ Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});