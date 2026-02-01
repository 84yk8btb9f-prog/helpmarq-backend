import auth from '../config/auth.js';

export const requireAuth = async (req, res, next) => {
    try {
        // ✅ Check for token in Authorization header first
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            
            // Verify token with Better Auth
            const session = await auth.api.getSession({
                headers: {
                    ...req.headers,
                    cookie: `better-auth.session_token=${token}`
                }
            });
            
            if (session && session.user) {
                req.user = session.user;
                req.session = session.session;
                return next();
            }
        }
        
        // ✅ Fallback to cookie-based auth
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

// ✅ MUST EXPORT THIS - used by routes
export const getUserId = (req) => {
    return req.user?.id || null;
};