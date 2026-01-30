import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from 'mongoose';
import OTP from '../models/OTP.js';
import { sendOTPEmail } from '../services/emailService.js';

// ✅ CRITICAL: Better Auth configuration for production
const auth = betterAuth({
    database: mongodbAdapter(mongoose.connection),
    
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url }) => {
            console.log('Password reset for:', user.email);
            // TODO: Implement if needed
        }
    },
    
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
        cookieCache: {
            enabled: false,
            maxAge: 5 * 60 // 5 minutes
        }
    },
    
    // ✅ CRITICAL FIX: Remove domain restriction for cross-origin setup
advanced: {
    cookiePrefix: "helpmarq",
    crossSubDomainCookies: {
        enabled: false  // ← Changed to false (not same domain)
    },
    defaultCookieAttributes: {
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        path: '/',
        domain: undefined  // ← CRITICAL: Remove domain restriction
    }
},
    
    // ✅ PRODUCTION: Proper base URL
    baseURL: process.env.NODE_ENV === 'production'
        ? 'https://helpmarq-backend.onrender.com'
        : 'http://localhost:3000',
    
    trustedOrigins: process.env.NODE_ENV === 'production'
        ? ['https://helpmarq-frontend.vercel.app']
        : ['http://localhost:8080', 'http://localhost:5173'],
    
    // ✅ Email verification with OTP
    emailVerification: {
        sendVerificationEmail: async ({ user, url, token }) => {
            try {
                console.log('📧 Sending verification email to:', user.email);
                
                // Generate 6-digit OTP
                const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
                
                // Save OTP to database
                await OTP.create({
                    email: user.email.toLowerCase(),
                    code: otpCode,
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
                });
                
                // Send email
                await sendOTPEmail(user.email, otpCode);
                
                console.log('✅ Verification email sent successfully');
            } catch (error) {
                console.error('❌ Failed to send verification email:', error);
                throw error;
            }
        },
        
        sendOnSignUp: true,
        autoSignInAfterVerification: false
    },
    
    // ✅ Rate limiting
    rateLimit: {
        enabled: true,
        window: 60, // 1 minute
        max: 10 // 10 requests per minute
    }
});

export default auth;