import auth from '../config/auth.js';

// ✅ RECOMMENDED FIX: Use Better Auth's internal session verification
// Better Auth expects to handle the full request/response cycle
export const requireAuth = async (req, res, next) => {
    try {
        console.log('=== AUTH CHECK ===');
        console.log('Path:', req.path);
        console.log('Method:', req.method);
        
        // ✅ Extract cookies
        const cookieHeader = req.headers.cookie || req.headers.Cookie || '';
        console.log('Cookie header present:', !!cookieHeader);
        console.log('Cookie preview:', cookieHeader.substring(0, 100));
        
        // ✅ CRITICAL: Better Auth session extraction
        // We need to call the getSession endpoint properly
        const sessionResponse = await auth.api.getSession({
            headers: new Headers({
                'cookie': cookieHeader,
                'content-type': 'application/json'
            })
        });
        
        console.log('Session response:', sessionResponse ? 'received' : 'null');
        
        // ✅ Better Auth returns the session data directly or wrapped
        let user = null;
        let session = null;
        
        // Handle different possible response structures
        if (sessionResponse) {
            if (sessionResponse.user) {
                // Direct structure
                user = sessionResponse.user;
                session = sessionResponse.session;
            } else if (sessionResponse.data) {
                // Wrapped structure
                user = sessionResponse.data.user;
                session = sessionResponse.data.session;
            }
        }
        
        if (!user) {
            console.log('❌ No user found in session');
            console.log('Session response structure:', JSON.stringify(sessionResponse || {}).substring(0, 200));
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        
        console.log('✅ Authenticated:', user.email);
        console.log('User ID:', user.id);
        
        // ✅ Attach to request
        req.user = user;
        req.session = session;
        
        next();
        
    } catch (error) {
        console.error('❌ Auth error:', error.message);
        
        // ✅ Check if it's a session expiry or invalid session
        if (error.message?.includes('session') || error.message?.includes('token')) {
            return res.status(401).json({
                success: false,
                error: 'Session expired - please log in again'
            });
        }
        
        return res.status(401).json({
            success: false,
            error: 'Authentication failed'
        });
    }
};

export const getUserId = (req) => {
    return req.user?.id || null;
};