const express = require('express');
const router = express.Router();
const { requireAuth, getUserId } = require('../middleware/auth');
const Reviewer = require('../models/Reviewer');
const Project = require('../models/Project');

// Get current user info
router.get('/me', requireAuth, async (req, res) => {
    try {
        const userId = getUserId(req);
        
        // Check if user is a reviewer
        const reviewer = await Reviewer.findOne({ clerkUserId: userId });
        
        if (reviewer) {
            return res.json({
                success: true,
                role: 'reviewer',
                data: reviewer
            });
        }
        
        // Check if user owns any projects (is an owner)
        const projects = await Project.find({ ownerId: userId });
        
        if (projects.length > 0) {
            return res.json({
                success: true,
                role: 'owner',
                data: {
                    userId,
                    projectCount: projects.length
                }
            });
        }
        
        // New user - no role yet
        res.json({
            success: true,
            role: null,
            data: { userId }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create reviewer profile (after Clerk signup)
router.post('/create-reviewer', requireAuth, async (req, res) => {
    try {
        const userId = getUserId(req);
        
        console.log('=== CREATE REVIEWER REQUEST ===');
        console.log('User ID:', userId);
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('Body keys:', Object.keys(req.body));
        
        const { username, email, expertise, experience, portfolio, bio } = req.body;
        
        console.log('Extracted values:');
        console.log('- username:', username);
        console.log('- email:', email);
        console.log('- expertise:', expertise);
        console.log('- experience:', experience);
        console.log('- portfolio:', portfolio);
        console.log('- bio:', bio ? bio.substring(0, 50) + '...' : 'MISSING');
        
        // Check if user already has a reviewer profile
        const existing = await Reviewer.findOne({ clerkUserId: userId });
        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'You already have a reviewer profile'
            });
        }
        
        // Create reviewer
        const reviewerData = {
            clerkUserId: userId,
            username,
            email,
            expertise,
            experience,
            portfolio: portfolio || '',
            bio
        };
        
        console.log('Creating reviewer with data:', JSON.stringify(reviewerData, null, 2));
        
        const reviewer = await Reviewer.create(reviewerData);
        
        console.log('✓ Reviewer created successfully:', reviewer._id);
        // Send welcome email
        const { sendEmail } = require('../services/emailService');
        await sendEmail('welcomeReviewer', email, {
            name: username
        });
        
        res.status(201).json({
            success: true,
            message: 'Reviewer profile created',
            data: reviewer
        });
        
    } catch (error) {
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
                error: 'Username or email already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;