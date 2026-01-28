import express from 'express';
import { requireAuth, getUserId } from '../middleware/auth.js';
import Reviewer from '../models/Reviewer.js';
import Project from '../models/Project.js';
import { sendWelcomeEmail } from '../services/emailService.js';

const router = express.Router();

// Get current user info and role
router.get('/me', requireAuth, async (req, res) => {
    try {
        const userId = getUserId(req);

        // Check if reviewer exists
        const reviewer = await Reviewer.findOne({ userId });
        if (reviewer) {
            return res.json({
                success: true,
                role: 'reviewer',
                data: reviewer
            });
        }

        // Check if user has projects (is owner)
        const projects = await Project.find({ ownerId: userId });
        if (projects.length > 0) {
            return res.json({
                success: true,
                role: 'owner',
                data: { userId, projectCount: projects.length }
            });
        }

        // New user, no role yet
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

        // ✅ FIX: Send welcome email with better error handling
        try {
            console.log('Sending welcome email to:', email);
            await sendWelcomeEmail({ email, name: username }, 'reviewer');
            console.log('✓ Welcome email sent successfully');
        } catch (emailError) {
            console.error('❌ Welcome email failed (non-blocking):', emailError);
            // Don't fail the request if email fails
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