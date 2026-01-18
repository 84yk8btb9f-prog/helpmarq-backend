const auth = require('../config/auth');

const requireAuth = async (req, res, next) => {
    try {
        const session = await auth.api.getSession({
            headers: req.headers
        });

        if (!session) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        req.user = session.user;
        req.session = session.session;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(401).json({
            success: false,
            error: 'Invalid session'
        });
    }
};

const getUserId = (req) => {
    return req.user?.id || null;
};

module.exports = { requireAuth, getUserId };