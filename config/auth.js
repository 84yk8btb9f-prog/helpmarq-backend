const { betterAuth } = require("better-auth");

const auth = betterAuth({
    database: {
        provider: "mongodb",
        url: process.env.MONGODB_URI
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false // Enable later in production
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
    }
});

module.exports = auth;