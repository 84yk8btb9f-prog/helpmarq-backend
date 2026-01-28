import express from 'express';
import Feedback from '../models/Feedback.js';
import Application from '../models/Application.js';
import Project from '../models/Project.js';
import Reviewer from '../models/Reviewer.js';
import { requireAuth, getUserId } from '../middleware/auth.js';
import { sendReviewCompleteEmail, sendRatingReceivedEmail } from '../services/emailService.js';

const router = express.Router();

// Get feedback for a project
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
        console.error('Get feedback error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get feedback by reviewer
router.get('/reviewer/:reviewerId', async (req, res) => {
    try {
        const feedback = await Feedback.find({ 
            reviewerId: req.params.reviewerId 
        })
        .populate('projectId', 'title type ownerName')
        .sort({ submittedAt: -1 });

        res.json({
            success: true,
            count: feedback.length,
            data: feedback
        });
    } catch (error) {
        console.error('Get reviewer feedback error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Submit feedback
router.post('/', requireAuth, async (req, res) => {
    try {
        const { projectId, reviewerId, reviewerUsername, feedbackText, projectRating } = req.body;

        if (!projectId || !reviewerId || !reviewerUsername || !feedbackText) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required'
            });
        }

        // Check if application is approved
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

        // Check if feedback already exists
        const existingFeedback = await Feedback.findOne({ projectId, reviewerId });
        if (existingFeedback) {
            return res.status(400).json({
                success: false,
                error: 'You have already submitted feedback for this project'
            });
        }

        const feedback = await Feedback.create({
            projectId,
            reviewerId,
            reviewerUsername,
            feedbackText,
            projectRating: projectRating || null
        });

        // Update project review count
        await Project.findByIdAndUpdate(projectId, {
            $inc: { reviewsCount: 1 }
        });

        // Get project and reviewer for email
        const project = await Project.findById(projectId);
        const reviewer = await Reviewer.findById(reviewerId);

        // Send email to project owner
        try {
            await sendReviewCompleteEmail(project, feedback, reviewer);
        } catch (emailError) {
            console.error('Email error (non-blocking):', emailError);
        }

        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            data: feedback
        });
    } catch (error) {
        console.error('Submit feedback error:', error);
        
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

// Rate feedback
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

        // ✅ FIX: Get actual project XP
        const project = await Project.findById(feedback.projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }

        // ✅ FIX: Use project's actual XP as base
        let xpAwarded = project.xpReward;
        
        // Bonus/penalty based on rating
        if (rating === 5) xpAwarded += 50;      // 5 stars: +50 XP bonus
        else if (rating === 4) xpAwarded += 25; // 4 stars: +25 XP bonus
        else if (rating === 3) xpAwarded += 0;  // 3 stars: no change
        else if (rating === 2) xpAwarded -= 25; // 2 stars: -25 XP penalty
        else if (rating === 1) xpAwarded -= 50; // 1 star: -50 XP penalty

        // Don't award negative XP
        xpAwarded = Math.max(0, xpAwarded);

        feedback.ownerRating = rating;
        feedback.xpAwarded = xpAwarded;
        feedback.isRated = true;
        feedback.ratedAt = new Date();
        await feedback.save();

        // Update reviewer stats
        const reviewer = await Reviewer.findById(feedback.reviewerId);
        if (reviewer) {
            const oldLevel = reviewer.level;
            
            reviewer.xp += xpAwarded;
            reviewer.totalReviews += 1;

            // Calculate new average rating
            const allFeedback = await Feedback.find({
                reviewerId: reviewer._id,
                isRated: true
            });

            const totalRating = allFeedback.reduce((sum, f) => sum + f.ownerRating, 0);
            reviewer.averageRating = totalRating / allFeedback.length;

            reviewer.updateLevel();
            const leveledUp = reviewer.level > oldLevel;
            
            await reviewer.save();

            // Send rating email to reviewer
            try {
                console.log('Sending rating email to:', reviewer.email);
                await sendRatingReceivedEmail(reviewer, feedback, project);
                console.log('✓ Rating email sent successfully');
            } catch (emailError) {
                console.error('❌ Rating email failed (non-blocking):', emailError);
            }

            res.json({
                success: true,
                message: 'Feedback rated successfully',
                data: {
                    feedback,
                    xpAwarded,
                    leveledUp,
                    newReviewerXP: reviewer.xp,
                    newReviewerLevel: reviewer.level
                }
            });
        } else {
            res.json({
                success: true,
                message: 'Feedback rated successfully',
                data: { feedback, xpAwarded }
            });
        }
    } catch (error) {
        console.error('Rate feedback error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;