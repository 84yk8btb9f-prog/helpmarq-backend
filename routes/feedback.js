import express from 'express';
import Feedback from '../models/Feedback.js';
import Application from '../models/Application.js';
import Project from '../models/Project.js';
import Reviewer from '../models/Reviewer.js';
import { requireAuth, getUserId } from '../middleware/auth.js';
import { sendReviewCompleteEmail, sendRatingReceivedEmail } from '../services/emailService.js';

const router = express.Router();

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
        .populate('projectId', 'title type ownerName')
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

        await Project.findByIdAndUpdate(projectId, {
            $inc: { reviewsCount: 1 }
        });

        // Get project and reviewer for email
        const project = await Project.findById(projectId);
        const reviewer = await Reviewer.findById(reviewerId);

        // 📧 SEND REVIEW COMPLETE EMAIL TO OWNER
        try {
            await sendReviewCompleteEmail(project, feedback, reviewer);
            console.log('✓ Review complete email sent to owner');
        } catch (emailError) {
            console.error('Email error (non-blocking):', emailError);
        }

        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            data: feedback
        });
    } catch (error) {
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

        let xpAwarded = 100;
        if (rating === 5) xpAwarded += 50;
        else if (rating === 4) xpAwarded += 25;
        else if (rating === 3) xpAwarded += 0;
        else if (rating === 2) xpAwarded -= 25;
        else if (rating === 1) xpAwarded -= 50;

        feedback.ownerRating = rating;
        feedback.xpAwarded = xpAwarded;
        feedback.isRated = true;
        feedback.ratedAt = new Date();
        await feedback.save();

        const reviewer = await Reviewer.findById(feedback.reviewerId);
        const oldLevel = reviewer.level;
        
        if (reviewer) {
            reviewer.xp += xpAwarded;
            reviewer.totalReviews += 1;

            const allFeedback = await Feedback.find({
                reviewerId: reviewer._id,
                isRated: true
            });

            const totalRating = allFeedback.reduce((sum, f) => sum + f.ownerRating, 0);
            reviewer.averageRating = totalRating / allFeedback.length;

            reviewer.updateLevel();
            await reviewer.save();
        }

        // Get project for email
        const project = await Project.findById(feedback.projectId);

        // 📧 SEND RATING RECEIVED EMAIL TO REVIEWER
        try {
            await sendRatingReceivedEmail(reviewer, feedback, project);
            console.log('✓ Rating received email sent to reviewer');
        } catch (emailError) {
            console.error('Email error (non-blocking):', emailError);
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

export default router;