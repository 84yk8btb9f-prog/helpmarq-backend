import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from "mongoose";

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const auth = betterAuth({
    database: mongodbAdapter(mongoose.connection),
    
    secret: process.env.BETTER_AUTH_SECRET,
    
    baseURL: IS_PRODUCTION
        ? "https://helpmarq-backend.onrender.com"
        : "http://localhost:3000",
    
    // ✅ Safari-compatible session config
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60,
        },
    },
    
    // ✅ CRITICAL: Cross-origin cookie settings
    advanced: {
        cookies: IS_PRODUCTION
            ? {
                // Production: Cross-origin (Vercel → Render)
                sameSite: "none",
                secure: true,
                httpOnly: true,
                path: "/",
                // Don't set domain - let browser handle it
            }
            : {
                // Development: Same-origin
                sameSite: "lax",
                secure: false,
                httpOnly: true,
                path: "/",
            },
        
        // ✅ Cross-origin configuration
        crossSubDomainCookies: {
            enabled: false, // Not needed for different domains
        },
    },
    
    // ✅ Email verification
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url }) => {
            console.log(`Reset password URL for ${user.email}:`, url);
        },
    },
    
    // ✅ Trusted origins
    trustedOrigins: IS_PRODUCTION
        ? [
            "https://helpmarq-frontend.vercel.app",
        ]
        : [
            "http://localhost:8080",
            "http://localhost:5173",
            "http://127.0.0.1:8080",
            "http://127.0.0.1:5173",
        ],
});

export default auth;