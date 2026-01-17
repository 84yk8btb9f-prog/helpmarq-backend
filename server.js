require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');
const connectDB = require('./config/database');
const { startCronJobs } = require('./services/cronJobs');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true
}));
app.use(express.json());
app.use(ClerkExpressWithAuth());

// Logging
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
});

// Import routes
const projectsRouter = require('./routes/projects');
const reviewersRouter = require('./routes/reviewers');
const applicationsRouter = require('./routes/applications');
const feedbackRouter = require('./routes/feedback');
const authRouter = require('./routes/auth');
const statsRouter = require('./routes/stats');
const notificationsRouter = require('./routes/notifications');

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'HelpMarq API - Expert insights. Accessible pricing.',
        version: '2.0',
        status: 'Running',
        endpoints: {
            auth: '/api/auth',
            projects: '/api/projects',
            reviewers: '/api/reviewers',
            applications: '/api/applications',
            feedback: '/api/feedback'
        }
    });
});

// Use routes
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/reviewers', reviewersRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/feedback', feedbackRouter);
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
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 HelpMarq API running on http://localhost:${PORT}`);
    console.log('📊 MongoDB connected and ready');
    console.log('🔐 Clerk authentication active');
    
    // Start cron jobs
    startCronJobs();
});