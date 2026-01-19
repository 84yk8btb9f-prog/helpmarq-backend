import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from "mongoose";

const auth = betterAuth({
    database: mongodbAdapter(mongoose.connection),
    
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false, // Set to true once email is configured
        sendResetPassword: async ({ user, url }) => {
            // TODO: Add email sending logic here
            console.log(`Reset password URL for ${user.email}: ${url}`);
        }
    },
    
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // Update every 24 hours
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60 // 5 minutes
        }
    },
    
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: null
            },
            name: {
                type: "string",
                required: false
            }
        }
    },
    
    trustedOrigins: [
        "http://localhost:8080",
        "https://helpmarq.vercel.app",
        "https://sapavault.com",
        "https://www.sapavault.com"
    ],
    
    advanced: {
        cookieName: "helpmarq_session",
        crossSubdomainCookie: {
            enabled: true,
            domain: process.env.COOKIE_DOMAIN || undefined
        }
    }
});

export default auth;