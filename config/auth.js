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
    
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60,
        },
        // ✅ ADD: Explicit cookie name
        cookieName: "better-auth.session_token",
    },
    
    advanced: {
        cookies: IS_PRODUCTION ? {
            sameSite: "none",
            secure: true,
            httpOnly: true,
            path: "/",
            domain: undefined,
            name: "better-auth.session_token",
        } : {
            sameSite: "lax",
            secure: false,
            httpOnly: true,
            path: "/",
            name: "better-auth.session_token",
        },
        
        crossSubDomainCookies: {
            enabled: false,
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