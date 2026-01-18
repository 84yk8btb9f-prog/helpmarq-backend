require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const auth = require('./config/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Connect to MongoDB
connectDB();

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
        timestamp: new Date().toISOString()
    });
});

// Import routes
const authRouter = require('./routes/auth');
const projectsRouter = require('./routes/projects');
const reviewersRouter = require('./routes/reviewers');
const applicationsRouter = require('./routes/applications');
const feedbackRouter = require('./routes/feedback');
const statsRouter = require('./routes/stats');
const notificationsRouter = require('./routes/notifications');

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
    
    // Don't leak error details in production
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
    console.log(`📧 Email service ready`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});