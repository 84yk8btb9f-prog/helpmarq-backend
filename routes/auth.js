const express = require('express');
const router = express.Router();
const auth = require('../config/auth');
const { requireAuth, getUserId } = require('../middleware/auth');
const Reviewer = require('../models/Reviewer');
const Project = require('../models/Project');

// Mount Better Auth API routes
router.all('/*', (req, res, next) => {
    return auth.handler(req, res);
});

// Get current user info
router.get('/me', requireAuth, async (req, res) => {
    try {
        const userId = getUserId(req);
        
        // Check if reviewer
        const reviewer = await Reviewer.findOne({ userId });
        if (reviewer) {
            return res.json({
                success: true,
                role: 'reviewer',
                data: reviewer
            });
        }
        
        // Check if owner
        const projects = await Project.find({ ownerId: userId });
        if (projects.length > 0) {
            return res.json({
                success: true,
                role: 'owner',
                data: { userId, projectCount: projects.length }
            });
        }
        
        // New user
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

// Create reviewer profile (after signup)
router.post('/create-reviewer', requireAuth, async (req, res) => {
    try {
        const userId = getUserId(req);
        
        console.log('=== CREATE REVIEWER REQUEST ===');
        console.log('User ID:', userId);
        console.log('Request body:', req.body);
        
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
                error: 'You already have a reviewer profile'
            });
        }
        
        // Create reviewer
        const reviewer = await Reviewer.create({
            userId,  // Changed from clerkUserId
            username,
            email,
            expertise,
            experience,
            portfolio: portfolio || '',
            bio
        });
        
        console.log('✓ Reviewer created:', reviewer._id);
        
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
                error: 'Username already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;