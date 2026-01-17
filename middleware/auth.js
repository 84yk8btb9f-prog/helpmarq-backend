const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// Middleware to verify Clerk authentication
const requireAuth = ClerkExpressRequireAuth({
    onError: (error) => {
        console.error('Auth error:', error);
        return {
            status: 401,
            message: 'Authentication required'
        };
    }
});

// Extract user ID from Clerk token
const getUserId = (req) => {
    return req.auth?.userId || null;
};

module.exports = { requireAuth, getUserId };