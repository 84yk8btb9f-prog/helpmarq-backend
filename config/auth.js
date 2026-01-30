import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from 'mongoose';

const auth = betterAuth({
    database: mongodbAdapter(mongoose.connection),
    
    // ✅ CRITICAL: Use production URL for Render
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
    
    // ✅ FIX: Session configuration
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60 // 5 minutes
        },
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
        cookieName: "better_auth_session", // ✅ Changed from helpmarq_session
    },
    
    // ✅ CRITICAL: Cookie options for cross-origin (Vercel ↔ Render)
    advanced: {
        cookieOptions: {
            // ✅ MUST BE 'none' for cross-origin cookies
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            
            // ✅ MUST BE true when sameSite is 'none' (HTTPS required)
            secure: process.env.NODE_ENV === 'production',
            
            // ✅ HttpOnly prevents JavaScript access (security)
            httpOnly: true,
            
            // ✅ Available on all paths
            path: '/',
            
            // ✅ CRITICAL: Do NOT set domain
            // Let browser handle domain automatically
            // Setting domain can break cookies on Render/Vercel
        }
    },
    
    // ✅ CRITICAL: Only list your EXACT frontend domain
    trustedOrigins: process.env.NODE_ENV === 'production'
        ? [
            "https://helpmarq-frontend.vercel.app",
          ]
        : ["http://localhost:8080", "http://127.0.0.1:8080", "http://localhost:5173"]
});

export default auth;