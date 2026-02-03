import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/database.js';
import rateLimit from 'express-rate-limit';
import auth from './config/auth.js';
import mongoose from 'mongoose';
import { startCronJobs } from './services/cronJobs.js';
import { toNodeHandler } from "better-auth/node";
import { requireAuth } from './middleware/auth.js';

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

// ✅ Enhanced CORS for Safari
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        const allowedOrigins = NODE_ENV === 'production' 
            ? [
                'https://helpmarq-frontend.vercel.app',
                /\.vercel\.app$/, // All Vercel deployments
              ]
            : [
                'http://localhost:8080',
                'http://127.0.0.1:8080',
                'http://localhost:5173',
                'http://127.0.0.1:5173'
              ];
        
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
    credentials: true, // ✅ CRITICAL for cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Cookie',
        'Set-Cookie',
        'X-Requested-With',
        'Accept',
        'Origin',
    ],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400,
    optionsSuccessStatus: 200,
    preflightContinue: false,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

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

// ✅ CUSTOM SIGNUP - Use Better Auth's signup then add OTP
app.post('/api/auth/sign-up/email', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        
        console.log('=== SIGNUP REQUEST ===');
        console.log('Email:', email);
        
        // Step 1: Use Better Auth's built-in signup (it handles password hashing)
        const signupResult = await auth.api.signUpEmail({
            body: { email, password, name },
            headers: req.headers
        });
        
        if (!signupResult) {
            throw new Error('Signup failed');
        }
        
        console.log('✅ Better Auth signup complete');
        
        // Step 2: Generate OTP
        const OTP = (await import('./models/OTP.js')).default;
        const { sendOTPEmail } = await import('./services/emailService.js');
        
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        await OTP.create({
            email: email.toLowerCase(),
            code: code,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });
        
        await sendOTPEmail(email, code);
        
        console.log('✅ OTP sent');
        
        res.json({
            success: true,
            message: 'Account created. Check email for verification code.'
        });
        
    } catch (error) {
        console.error('❌ Signup error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Signup failed'
        });
    }
});

// Mount Better Auth
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

// ========================================
// ✅ FIXED OTP VERIFICATION WITH PROPER SESSION CREATION
// ========================================
// ========================================

app.post('/api/verify-otp', async (req, res) => {
    try {
        const { email, code } = req.body;
        
        console.log('=== OTP VERIFICATION START ===');
        console.log('Email:', email);
        
        if (!email || !code) {
            return res.status(400).json({
                success: false,
                error: 'Email and code required'
            });
        }
        
        const OTP = (await import('./models/OTP.js')).default;
        
        // STEP 1: Validate OTP
        const otpRecord = await OTP.findOne({
            email: email.toLowerCase(),
            code: code,
            verified: false,
            expiresAt: { $gt: new Date() }
        });
        
        if (!otpRecord) {
            console.log('❌ Invalid or expired OTP');
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired code'
            });
        }
        
        console.log('✅ OTP valid');
        
        // STEP 2: Mark OTP as verified
        otpRecord.verified = true;
        await otpRecord.save();
        
        console.log('✅ OTP marked as verified');
        
        // STEP 3: Update emailVerified in user document
        await mongoose.connection.db.collection('user').updateOne(
            { email: email.toLowerCase() },
            { $set: { emailVerified: true } }
        );
        
        console.log('✅ Email verified in database');
        
        // STEP 4: Get user data
        const userDoc = await mongoose.connection.db.collection('user').findOne({
            email: email.toLowerCase()
        });
        
        if (!userDoc) {
            throw new Error('User not found');
        }
        
        // ========================================
        // ✅ RETURN SUCCESS - Frontend will call Better Auth sign-in
        // ========================================
        
        res.json({
            success: true,
            message: 'Email verified successfully',
            user: {
                id: userDoc._id.toString(),
                email: userDoc.email,
                name: userDoc.name
            }
        });
        
        console.log('=== OTP VERIFICATION COMPLETE ===');
        console.log('User verified:', userDoc.email, '(ID:', userDoc._id.toString(), ')');
        console.log('Frontend will now handle sign-in via Better Auth endpoint');
        
    } catch (error) {
        console.error('❌ OTP verification error:', error);
        console.error('Stack:', error.stack);
        
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// ========================================
// RESEND OTP ENDPOINT
// ========================================
app.post('/api/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email required'
            });
        }
        
        console.log('=== RESEND OTP REQUEST ===');
        console.log('Email:', email);
        
        // Check if user exists
        const user = await mongoose.connection.db.collection('user').findOne({
            email: email.toLowerCase()
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        // Check if already verified
        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                error: 'Email already verified'
            });
        }
        
        // Generate new OTP
        const OTP = (await import('./models/OTP.js')).default;
        const { sendOTPEmail } = await import('./services/emailService.js');
        
        // Invalidate old OTPs
        await OTP.updateMany(
            { email: email.toLowerCase(), verified: false },
            { $set: { expiresAt: new Date() } }
        );
        
        // Create new OTP
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        await OTP.create({
            email: email.toLowerCase(),
            code: code,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        });
        
        // Send OTP email
        await sendOTPEmail(email, code);
        
        console.log('✅ New OTP sent to:', email);
        
        res.json({
            success: true,
            message: 'New verification code sent'
        });
        
    } catch (error) {
        console.error('❌ Resend OTP error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Debug endpoints
app.get('/api/debug/session', async (req, res) => {
    console.log('=== DEBUG SESSION ===');
    
    const debugInfo = {
        timestamp: new Date().toISOString(),
        cookiesPresent: !!req.headers.cookie,
        cookiePreview: req.headers.cookie ? req.headers.cookie.substring(0, 100) : 'NONE'
    };
    
    try {
        const session = await auth.api.getSession({
            headers: new Headers({
                'cookie': req.headers.cookie || '',
                'content-type': 'application/json'
            })
        });
        
        if (session && (session.user || session.data?.user)) {
            const user = session.user || session.data?.user;
            debugInfo.session = {
                status: 'VALID',
                userId: user.id,
                email: user.email
            };
        } else {
            debugInfo.session = {
                status: 'INVALID',
                response: 'No user found'
            };
        }
    } catch (error) {
        debugInfo.session = {
            status: 'ERROR',
            error: error.message
        };
    }
    
    res.json({ success: true, debug: debugInfo });
});

app.get('/api/debug/protected', requireAuth, (req, res) => {
    res.json({
        success: true,
        message: 'Protected route works!',
        user: { id: req.user.id, email: req.user.email }
    });
});

// ========================================
// ✅ ADD THIS DEBUG ENDPOINT to server.js (around line 400, before error handlers)
// ========================================

app.get('/api/debug/cookies', async (req, res) => {
    console.log('=== DEBUG COOKIES ENDPOINT ===');
    
    const debugInfo = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        headers: {
            cookie: req.headers.cookie || 'NONE',
            origin: req.headers.origin || 'NONE',
            referer: req.headers.referer || 'NONE',
            userAgent: req.headers['user-agent']?.substring(0, 50) || 'NONE'
        },
        cookies: {
            raw: req.headers.cookie || 'NONE',
            parsed: req.cookies || {}
        }
    };
    
    // Try to parse session cookie
    if (req.headers.cookie) {
        const cookies = req.headers.cookie.split(';').map(c => c.trim());
        const sessionCookie = cookies.find(c => c.startsWith('better-auth.session_token='));
        
        if (sessionCookie) {
            const token = sessionCookie.split('=')[1];
            debugInfo.sessionToken = {
                present: true,
                tokenPreview: token.substring(0, 10) + '...',
                length: token.length
            };
            
            // Check if session exists in database
            try {
                const session = await mongoose.connection.db.collection('session').findOne({
                    token: token
                });
                
                debugInfo.sessionInDatabase = {
                    found: !!session,
                    expired: session ? session.expiresAt < new Date() : null,
                    userId: session?.userId || null
                };
            } catch (dbError) {
                debugInfo.sessionInDatabase = {
                    error: dbError.message
                };
            }
        } else {
            debugInfo.sessionToken = {
                present: false,
                availableCookies: cookies.map(c => c.split('=')[0])
            };
        }
    }
    
    // Try auth check
    try {
        const session = await auth.api.getSession({
            headers: new Headers({
                'cookie': req.headers.cookie || '',
                'content-type': 'application/json'
            })
        });
        
        if (session && (session.user || session.data?.user)) {
            const user = session.user || session.data?.user;
            debugInfo.authCheck = {
                status: 'AUTHENTICATED',
                userId: user.id,
                email: user.email
            };
        } else {
            debugInfo.authCheck = {
                status: 'NO_SESSION',
                response: 'No user found'
            };
        }
    } catch (error) {
        debugInfo.authCheck = {
            status: 'ERROR',
            error: error.message
        };
    }
    
    res.json({
        success: true,
        debug: debugInfo
    });
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

// ✅ Enhanced error handler
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
    console.log(`\n${signal} received, shutting down gracefully...`);
    
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

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});