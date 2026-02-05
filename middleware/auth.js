import auth from '../config/auth.js';

export const requireAuth = async (req, res, next) => {
    try {
        console.log('=== AUTH CHECK ===');
        console.log('Path:', req.path);
        console.log('Method:', req.method);
        
        // Extract cookies
        const cookieHeader = req.headers.cookie || req.headers.Cookie || '';
        console.log('Cookie header present:', !!cookieHeader);
        
        if (!cookieHeader) {
            console.log('❌ No cookies in request');
            console.log('Request headers:', JSON.stringify(req.headers, null, 2)); // ✅ ADD THIS LINE
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        
        // ✅ CRITICAL: Call Better Auth's getSession with proper headers
        const sessionResponse = await auth.api.getSession({
            headers: new Headers({
                'cookie': cookieHeader,
                'content-type': 'application/json'
            })
        });
        
        console.log('Session response:', sessionResponse ? 'received' : 'null');
        
        // Handle different response structures
        let user = null;
        let session = null;
        
        if (sessionResponse) {
            if (sessionResponse.user) {
                user = sessionResponse.user;
                session = sessionResponse.session;
            } else if (sessionResponse.data) {
                user = sessionResponse.data.user;
                session = sessionResponse.data.session;
            }
        }
        
        if (!user) {
            console.log('❌ No user found in session');
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        
        console.log('✅ Authenticated:', user.email);
        console.log('User ID:', user.id);
        
        req.user = user;
        req.session = session;
        
        next();
        
    } catch (error) {
        console.error('❌ Auth error:', error.message);
        
        return res.status(401).json({
            success: false,
            error: 'Authentication failed'
        });
    }
};

export const getUserId = (req) => {
    return req.user?.id || null;
};