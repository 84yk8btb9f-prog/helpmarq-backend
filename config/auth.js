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
        updateAge: 60 * 60 * 24 // Update every 24 hours
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false
            }
        }
    },
    trustedOrigins: [
        "http://localhost:8080",
        "https://helpmarq.vercel.app"
    ]
});

export default auth;