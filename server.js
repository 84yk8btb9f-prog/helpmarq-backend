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

// CORS configuration
const corsOptions = {
    origin: NODE_ENV === 'production' 
        ? ['https://helpmarq.vercel.app', 'https://www.helpmarq.com', 'https://www.sapavault.com', 'https://sapavault.com']
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

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'HelpMarq API - Expert insights. Accessible pricing.',
        version: '2.0',
        status: 'Running',
        environment: NODE_ENV
    });
});

// Better Auth - FIXED with proper response handling
app.use('/api/auth/', toNodeHandler(auth));

// ✅ ADD: Welcome email trigger after signup
app.post('/api/auth/sign-up/email', async (req, res, next) => {
    try {
        // Let Better Auth handle the signup first
        await next();
        
        // Then send welcome email
        const { email, name } = req.body;
        if (email && name) {
            try {
                const { sendWelcomeEmail } = await import('./services/emailService.js');
                await sendWelcomeEmail({ email, name }, 'owner');
                console.log('✓ Signup welcome email sent to:', email);
            } catch (emailError) {
                console.error('❌ Signup email failed (non-blocking):', emailError);
            }
        }
    } catch (error) {
        console.error('Signup error:', error);
        throw error;
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

app.get('/api/test-email', async (req, res) => {
    try {
        const { sendWelcomeEmail } = await import('./services/emailService.js');
        await sendWelcomeEmail({ 
            email: 'helpmarq@sapavault.com', 
            name: 'Test User' 
        }, 'owner');
        res.json({ success: true, message: 'Test email sent to helpmarq@sapavault.com' });
    } catch (error) {
        console.error('Test email error:', error);
        res.json({ success: false, error: error.message });
    }
});


// Mount API routes
app.use('/api/user', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/reviewers', reviewersRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/stats', statsRouter);
app.use('/api/notifications', notificationsRouter);

// ✅ ADD THIS DEBUG ENDPOINT HERE (before 404 handler)
app.get('/api/debug/check-user-schema', async (req, res) => {
    try {
        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📊 All collections:', collections.map(c => c.name));
        
        // Find user-related collection
        const userCollection = collections.find(c => 
            c.name.toLowerCase().includes('user')
        );
        
        if (!userCollection) {
            return res.json({ 
                success: false,
                error: 'No user collection found',
                allCollections: collections.map(c => c.name)
            });
        }
        
        // Get one sample user to see structure
        const sampleUser = await mongoose.connection.db
            .collection(userCollection.name)
            .findOne({});
        
        res.json({
            success: true,
            collectionName: userCollection.name,
            fields: sampleUser ? Object.keys(sampleUser) : [],
            sampleUserExample: sampleUser ? {
                _id: sampleUser._id,
                email: sampleUser.email,
                emailVerified: sampleUser.emailVerified,
                createdAt: sampleUser.createdAt,
                // Show structure without exposing sensitive data
                hasPassword: !!sampleUser.password,
                allFields: Object.keys(sampleUser)
            } : null
        });
        
    } catch (error) {
        console.error('Debug endpoint error:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// TEST EMAIL - Remove after testing
app.get('/api/test-email', async (req, res) => {
    try {
        const { sendVerificationEmail } = await import('./services/emailService.js');
        
        // CHANGE THIS to your email:
        const testEmail = 'your-email@example.com';
        const testUrl = 'http://localhost:8080/test';
        
        console.log('🧪 Testing email...');
        const result = await sendVerificationEmail(testEmail, testUrl);
        
        res.json({
            success: result.success,
            message: result.success ? 'Check your inbox!' : 'Failed',
            error: result.error
        });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

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
        
        // Find valid OTP
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
        
        // Mark OTP as verified
        otpRecord.verified = true;
        await otpRecord.save();
        
        // Update user email verification in Better Auth collection
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
    
    // ✅ START CRON JOBS
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
// TEST EMAIL ENDPOINT (remove after testing)
app.get('/api/test-email', async (req, res) => {
    try {
        const { sendWelcomeEmail } = await import('./services/emailService.js');
        await sendWelcomeEmail({ 
            email: 'helpmarq@sapavault.com', 
            name: 'Test User' 
        }, 'owner');
        res.json({ success: true, message: 'Test email sent' });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});