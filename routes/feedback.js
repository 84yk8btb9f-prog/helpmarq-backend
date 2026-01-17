const { requireAuth, getUserId } = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const Application = require('../models/Application');
const Project = require('../models/Project');
const Reviewer = require('../models/Reviewer');

// Get all feedback for a project
router.get('/project/:projectId', async (req, res) => {
    try {
        const feedback = await Feedback.find({ 
            projectId: req.params.projectId 
        }).sort({ submittedAt: -1 });

        res.json({
            success: true,
            count: feedback.length,
            data: feedback
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get all feedback by a reviewer
router.get('/reviewer/:reviewerId', async (req, res) => {
    try {
        const feedback = await Feedback.find({ 
            reviewerId: req.params.reviewerId 
        })
        .populate('projectId', 'title type owner')
        .sort({ submittedAt: -1 });

        res.json({
            success: true,
            count: feedback.length,
            data: feedback
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Submit feedback (approved reviewers only)
router.post('/', requireAuth, async (req, res) => {
    try {
        const { projectId, reviewerId, reviewerUsername, feedbackText, projectRating } = req.body;

        // Validation
        if (!projectId || !reviewerId || !reviewerUsername || !feedbackText) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required'
            });
        }

        // Check if reviewer is approved
        const application = await Application.findOne({
            projectId,
            reviewerId,
            status: 'approved'
        });

        if (!application) {
            return res.status(403).json({
                success: false,
                error: 'You must be approved to submit feedback'
            });
        }

        // Check if already submitted
        const existingFeedback = await Feedback.findOne({ projectId, reviewerId });
        if (existingFeedback) {
            return res.status(400).json({
                success: false,
                error: 'You have already submitted feedback for this project'
            });
        }

        // Create feedback
        const feedback = await Feedback.create({
            projectId,
            reviewerId,
            reviewerUsername,
            feedbackText,
            projectRating: projectRating || null
        });

        // Update project reviews count
        await Project.findByIdAndUpdate(projectId, {
            $inc: { reviewsCount: 1 }
        });
// Send email to owner
        const { sendEmail } = require('../services/emailService');
        const project = await Project.findById(projectId);
        
        await sendEmail('reviewComplete', project.ownerEmail || 'owner@email.com', {
            projectTitle: project.title,
            reviewerName: reviewerUsername,
            feedbackPreview: feedbackText.substring(0, 150),
            projectRating
        });
        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            data: feedback
        });
    } catch (error) {
        // Duplicate feedback
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'You have already submitted feedback for this project'
            });
        }

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: errors[0]
            });
        }

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Rate feedback (owner rates reviewer's work)
router.put('/:id/rate', requireAuth, async (req, res) => {
    try {
        const { rating } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                error: 'Rating must be between 1 and 5'
            });
        }

        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            return res.status(404).json({
                success: false,
                error: 'Feedback not found'
            });
        }

        if (feedback.isRated) {
            return res.status(400).json({
                success: false,
                error: 'Feedback has already been rated'
            });
        }

        // Calculate XP based on rating
        let xpAwarded = 100; // Base XP
        if (rating === 5) xpAwarded += 50;      // Perfect: 150 XP
        else if (rating === 4) xpAwarded += 25; // Good: 125 XP
        else if (rating === 3) xpAwarded += 0;  // Average: 100 XP
        else if (rating === 2) xpAwarded -= 25; // Below average: 75 XP
        else if (rating === 1) xpAwarded -= 50; // Poor: 50 XP

        // Update feedback
        feedback.ownerRating = rating;
        feedback.xpAwarded = xpAwarded;
        feedback.isRated = true;
        feedback.ratedAt = new Date();
        await feedback.save();

        // Update reviewer stats
        const reviewer = await Reviewer.findById(feedback.reviewerId);
        if (reviewer) {
            reviewer.xp += xpAwarded;
            reviewer.totalReviews += 1;

            // Recalculate average rating
            const allFeedback = await Feedback.find({
                reviewerId: reviewer._id,
                isRated: true
            });

            const totalRating = allFeedback.reduce((sum, f) => sum + f.ownerRating, 0);
            reviewer.averageRating = totalRating / allFeedback.length;

            // Update level
            reviewer.updateLevel();

            await reviewer.save();
            
            // Check if leveled up
            const oldLevel = Math.floor((reviewer.xp - xpAwarded) / 500) + 1;
            const leveledUp = reviewer.level > oldLevel;
            
            // Send rating email to reviewer
            const { sendEmail } = require('../services/emailService');
            await sendEmail('ratingReceived', reviewer.email, {
                projectTitle: feedback.projectId.title || 'project',
                rating: rating,
                xpAwarded: xpAwarded,
                newLevel: reviewer.level,
                totalXP: reviewer.xp,
                totalReviews: reviewer.totalReviews,
                avgRating: reviewer.averageRating.toFixed(1),
                leveledUp
            });
        }

        res.json({
            success: true,
            message: 'Feedback rated successfully',
            data: {
                feedback,
                xpAwarded,
                newReviewerXP: reviewer ? reviewer.xp : null,
                newReviewerLevel: reviewer ? reviewer.level : null
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;