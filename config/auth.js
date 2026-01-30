import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from 'mongoose';

const auth = betterAuth({
    database: mongodbAdapter(mongoose.connection),
    
    // ✅ CRITICAL FIX: Use exact production URL
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
                const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
                
                console.log('📧 Generating OTP for:', user.email);
                console.log('OTP Code:', otpCode);
                
                const OTP = (await import('../models/OTP.js')).default;
                await OTP.create({
                    email: user.email,
                    code: otpCode,
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
                });
                
                console.log('✅ OTP saved to database');
                
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
        expiresIn: 10 * 60
    },
    
    // ✅ FIX: Enhanced session configuration
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60
        },
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
        // ✅ FIX: Use simple cookie name
        cookieName: "auth_session",
    },
    
    // ✅ CRITICAL FIX: Enhanced cookie options for cross-origin
    advanced: {
        cookieOptions: {
            // ✅ MUST BE 'none' for cross-origin (Vercel ↔ Render)
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            
            // ✅ MUST BE true when sameSite is 'none'
            secure: process.env.NODE_ENV === 'production',
            
            // ✅ HttpOnly for security
            httpOnly: true,
            
            // ✅ Root path
            path: '/',
            
            // ✅ FIX: Don't set domain - let browser handle it
            // This is critical for cookies to work across Vercel/Render
        }
    },
    
    // ✅ CRITICAL FIX: Exact frontend origins only
    trustedOrigins: process.env.NODE_ENV === 'production'
        ? [
            "https://helpmarq-frontend.vercel.app",
            // Add www variant if needed
            // "https://www.helpmarq-frontend.vercel.app",
          ]
        : [
            "http://localhost:8080",
            "http://127.0.0.1:8080",
            "http://localhost:5173",
            "http://127.0.0.1:5173"
          ],
    
    // ✅ FIX: Add explicit logging in development
    ...(process.env.NODE_ENV === 'development' && {
        logger: {
            level: 'debug'
        }
    })
});

export default auth;