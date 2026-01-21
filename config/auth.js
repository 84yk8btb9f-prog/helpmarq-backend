import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from "mongoose";

const auth = betterAuth({
    database: mongodbAdapter(mongoose.connection),
    
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false
    },
    
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24 // 1 day
    },
    
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false
            }
        }
    },
    
    baseURL: process.env.NODE_ENV === 'production' 
        ? "https://helpmarq-backend.onrender.com"
        : "http://localhost:3000",
    
    trustedOrigins: [
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "https://helpmarq.vercel.app"
    ],
    
    advanced: {
        useSecureCookies: process.env.NODE_ENV === 'production',
        crossSubDomainCookie: {
            enabled: false
        }
    }
});

export default auth;