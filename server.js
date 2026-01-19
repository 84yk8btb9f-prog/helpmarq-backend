import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CRITICAL: Connect to MongoDB BEFORE initializing Better Auth
await connectDB();

// Wait for MongoDB connection to be ready
import mongoose from 'mongoose';
await new Promise((resolve) => {
    if (mongoose.connection.readyState === 1) {
        resolve();
    } else {
        mongoose.connection.once('open', resolve);
    }
});

console.log('✓ MongoDB connection ready');

// Now import auth (after MongoDB is connected)
const { default: auth } = await import('./config/auth.js');

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
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Request logging
if (NODE_ENV === 'development') {
    app.use((req, res, next) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${req.method} ${req.url}`);
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

// Import routes
import authRouter from './routes/auth.js';
import projectsRouter from './routes/projects.js';
import reviewersRouter from './routes/reviewers.js';
import applicationsRouter from './routes/applications.js';
import feedbackRouter from './routes/feedback.js';
import statsRouter from './routes/stats.js';
import notificationsRouter from './routes/notifications.js';

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'HelpMarq API - Expert insights. Accessible pricing.',
        version: '2.0',
        status: 'Running',
        environment: NODE_ENV,
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            projects: '/api/projects',
            reviewers: '/api/reviewers',
            applications: '/api/applications',
            feedback: '/api/feedback',
            stats: '/api/stats',
            notifications: '/api/notifications'
        }
    });
});

// Mount routes
app.use('/api/auth', authRouter);
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

// Error handler
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
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});