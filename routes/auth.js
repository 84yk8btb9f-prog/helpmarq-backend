import express from 'express';
import { requireAuth, getUserId } from '../middleware/auth.js';
import Reviewer from '../models/Reviewer.js';
import Project from '../models/Project.js';
import UserProfile from '../models/UserProfile.js';
import { sendWelcomeEmail } from '../services/emailService.js';

const router = express.Router();

// ✅ FIX: Get current user info and role (checks UserProfile first)
router.get('/me', requireAuth, async (req, res) => {
    try {
        const userId = getUserId(req);

        // ✅ FIX: Check UserProfile FIRST (most reliable)
        const userProfile = await UserProfile.findOne({ userId });
        if (userProfile) {
            console.log('✓ Found user profile with role:', userProfile.role);
            
            if (userProfile.role === 'reviewer') {
                const reviewer = await Reviewer.findOne({ userId });
                return res.json({
                    success: true,
                    role: 'reviewer',
                    data: reviewer || { userId }
                });
            } else {
                return res.json({
                    success: true,
                    role: 'owner',
                    data: { userId }
                });
            }
        }

        // Fallback: Check if reviewer exists (for users created before UserProfile)
        const reviewer = await Reviewer.findOne({ userId });
        if (reviewer) {
            // Create UserProfile for existing reviewer
            await UserProfile.create({
                userId,
                email: reviewer.email,
                name: reviewer.username,
                role: 'reviewer'
            });
            
            return res.json({
                success: true,
                role: 'reviewer',
                data: reviewer
            });
        }

        // Fallback: Check if user has projects (for existing owners)
        const projects = await Project.find({ ownerId: userId });
        if (projects.length > 0) {
            // Create UserProfile for existing owner
            await UserProfile.create({
                userId,
                email: projects[0].ownerEmail,
                name: projects[0].ownerName,
                role: 'owner'
            });
            
            return res.json({
                success: true,
                role: 'owner',
                data: { userId, projectCount: projects.length }
            });
        }

        // New user, no role yet
        console.log('No role found for user:', userId);
        res.json({
            success: true,
            role: null,
            data: { userId }
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ✅ NEW: Set owner role (called from role-select.html)
router.post('/set-owner-role', requireAuth, async (req, res) => {
    try {
        const userId = getUserId(req);
        const user = req.user; // From Better Auth session
        
        console.log('Setting owner role for user:', userId);
        
        // Check if profile already exists
        const existing = await UserProfile.findOne({ userId });
        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'User role already set'
            });
        }
        
        // Create UserProfile
        const profile = await UserProfile.create({
            userId,
            email: user.email,
            name: user.name || user.email,
            role: 'owner'
        });
        
        console.log('✓ Owner role saved to database');
        
        // Send welcome email
        try {
            await sendWelcomeEmail({ email: user.email, name: user.name }, 'owner');
            console.log('✓ Welcome email sent');
        } catch (emailError) {
            console.error('❌ Welcome email failed (non-blocking):', emailError);
        }
        
        res.json({
            success: true,
            message: 'Owner role set',
            data: profile
        });
        
    } catch (error) {
        console.error('Set owner role error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create reviewer profile
router.post('/create-reviewer', requireAuth, async (req, res) => {
    try {
        const userId = getUserId(req);
        const { username, email, expertise, experience, portfolio, bio } = req.body;

        // Validation
        if (!username || username.length < 3) {
            return res.status(400).json({
                success: false,
                error: 'Username must be at least 3 characters'
            });
        }

        if (!expertise) {
            return res.status(400).json({
                success: false,
                error: 'Expertise is required'
            });
        }

        if (!experience) {
            return res.status(400).json({
                success: false,
                error: 'Experience level is required'
            });
        }

        if (!bio || bio.length < 50) {
            return res.status(400).json({
                success: false,
                error: 'Bio must be at least 50 characters'
            });
        }

        // Check if reviewer already exists
        const existing = await Reviewer.findOne({ userId });
        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'Reviewer profile already exists'
            });
        }

        // Create reviewer
        const reviewer = await Reviewer.create({
            userId,
            username,
            email,
            expertise,
            experience,
            portfolio: portfolio || '',
            bio
        });
        
        // ✅ FIX: Create UserProfile too
        await UserProfile.create({
            userId,
            email,
            name: username,
            role: 'reviewer'
        });
        
        console.log('✓ Reviewer profile and UserProfile created');

        // Send welcome email
        try {
            console.log('Sending welcome email to:', email);
            await sendWelcomeEmail({ email, name: username }, 'reviewer');
            console.log('✓ Welcome email sent successfully');
        } catch (emailError) {
            console.error('❌ Welcome email failed (non-blocking):', emailError);
        }

        res.status(201).json({
            success: true,
            message: 'Reviewer profile created',
            data: reviewer
        });

    } catch (error) {
        console.error('Create reviewer error:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: errors[0]
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Username already taken'
            });
        }

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;