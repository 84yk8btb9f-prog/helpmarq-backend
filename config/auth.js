import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from 'mongoose';

const auth = betterAuth({
    database: mongodbAdapter(mongoose.connection),
    
    // ✅ FIX: Base URL for production
    baseURL: process.env.NODE_ENV === 'production' 
        ? "https://helpmarq-backend.onrender.com"
        : "http://localhost:3000",
    
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: true,
    },
    
    emailVerification: {
        sendVerificationEmail: async ({ user, url, token }) => {
            try {
                // Generate 6-digit OTP
                const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
                
                console.log('📧 Generating OTP for:', user.email);
                console.log('OTP Code:', otpCode);
                
                // Save OTP to database
                const OTP = (await import('../models/OTP.js')).default;
                await OTP.create({
                    email: user.email,
                    code: otpCode,
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 min
                });
                
                console.log('✅ OTP saved to database');
                
                // Send OTP email
                const { sendOTPEmail } = await import('../services/emailService.js');
                await sendOTPEmail(user.email, otpCode);
                
                console.log('✅ OTP email sent to:', user.email);
                return { success: true };
            } catch (error) {
                console.error('❌ OTP send failed:', error);
                console.error('Error stack:', error.stack);
                return { success: false, error: error.message };
            }
        },
        sendOnSignUp: true,
        autoSignInAfterVerification: false,
        expiresIn: 10 * 60 // 10 minutes
    },
    
    // ✅ FIX: Advanced session configuration for cross-domain
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60 // 5 minutes
        },
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
        cookieName: "helpmarq_session",
    },
    
    // ✅ FIX: Advanced options for cross-domain cookies
    advanced: {
        cookieOptions: {
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            path: '/',
        }
    },
    
    // ✅ FIXED: Correct trustedOrigins for production
    trustedOrigins: process.env.NODE_ENV === 'production'
        ? [
            "https://helpmarq-frontend.vercel.app",
            "https://www.sapavault.com",
            "https://sapavault.com"
          ]
        : ["http://localhost:8080", "http://127.0.0.1:8080"]
});

export default auth;