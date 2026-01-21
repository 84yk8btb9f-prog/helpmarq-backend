import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import rateLimit from 'express-rate-limit';
import auth from './config/auth.js';
import mongoose from 'mongoose';

const app = express();
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

// CORS configuration
const corsOptions = {
    origin: NODE_ENV === 'production' 
        ? ['https://helpmarq.vercel.app', 'https://www.helpmarq.com']
        : ['http://localhost:8080', 'http://127.0.0.1:8080'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
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

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'HelpMarq API - Expert insights. Accessible pricing.',
        version: '2.0',
        status: 'Running',
        environment: NODE_ENV
    });
});

// Better Auth - FIXED MOUNTING
app.use('/api/auth', async (req, res, next) => {
    try {
        // Construct full URL for Better Auth
        const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
        const host = req.get('x-forwarded-host') || req.get('host') || 'localhost:3000';
        const originalUrl = req.originalUrl || req.url;
        
        // Create proper request object with full URL
        const betterAuthReq = {
            ...req,
            url: `${protocol}://${host}${originalUrl}`,
            headers: {
                ...req.headers,
                'x-forwarded-proto': protocol,
                'x-forwarded-host': host
            }
        };
        
        return auth.handler(betterAuthReq, res);
    } catch (error) {
        console.error('Better Auth error:', error);
        next(error);
    }
});

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

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
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
app.listen(PORT, () => {
    console.log(`🚀 HelpMarq API running on port ${PORT}`);
    console.log(`📊 Environment: ${NODE_ENV}`);
    console.log(`🔐 Better Auth configured`);
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