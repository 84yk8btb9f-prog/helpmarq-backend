#!/bin/bash
echo "🔧 Fixing backend..."

# Fix middleware/auth.js
cat > middleware/auth.js << 'EOF'
import auth from '../config/auth.js';

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

export { requireAuth, getUserId };
EOF

# Fix routes/auth.js - REMOVE router.all line
sed -i.bak '/router\.all/d' routes/auth.js
echo 'router.use(auth.handler);' >> routes/auth.js
echo '' >> routes/auth.js
echo 'export default router;' >> routes/auth.js

rm -rf node_modules/.cache
echo "✅ Fixed!"
