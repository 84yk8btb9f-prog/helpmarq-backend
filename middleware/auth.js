import auth from '../config/auth.js';

export const requireAuth = async (req, res, next) => {
    try {
        const session = await auth.api.getSession({
            headers: req.headers
        });

        if (!session || !session.user) {
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

export const getUserId = (req) => {
    return req.user?.id || null;
};