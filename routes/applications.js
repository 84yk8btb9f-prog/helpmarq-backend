import express from 'express';
import Application from '../models/Application.js';
import Project from '../models/Project.js';
import Reviewer from '../models/Reviewer.js';
import { requireAuth, getUserId } from '../middleware/auth.js';
import { 
    sendApplicationReceivedEmail, 
    sendApplicationApprovedEmail, 
    sendApplicationRejectedEmail 
} from '../services/emailService.js';

const router = express.Router();

// Get all applications for a project
router.get('/project/:projectId', async (req, res) => {
    try {
        const applications = await Application.find({ 
            projectId: req.params.projectId 
        })
        .populate('reviewerId', 'username level xp totalReviews averageRating')
        .sort({ appliedAt: -1 });

        res.json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get all applications by a reviewer
router.get('/reviewer/:reviewerId', async (req, res) => {
    try {
        const applications = await Application.find({ 
            reviewerId: req.params.reviewerId 
        })
        .populate('projectId', 'title type ownerName xpReward')
        .sort({ appliedAt: -1 });

        res.json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create new application
router.post('/', requireAuth, async (req, res) => {
    try {
        const { projectId, reviewerId, reviewerUsername, qualifications, focusAreas } = req.body;

        if (!projectId || !reviewerId || !reviewerUsername || !qualifications || !focusAreas) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required'
            });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }

        const reviewer = await Reviewer.findById(reviewerId);
        if (!reviewer) {
            return res.status(404).json({
                success: false,
                error: 'Reviewer not found'
            });
        }

        const applicantIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown';
        
        const application = await Application.create({
            projectId,
            reviewerId,
            reviewerUsername,
            qualifications,
            focusAreas,
            ndaAccepted: true,
            ndaAcceptedAt: new Date(),
            applicantIp: applicantIp
        });

        await Project.findByIdAndUpdate(projectId, {
            $inc: { applicantsCount: 1 }
        });

        // 📧 SEND APPLICATION RECEIVED EMAIL TO OWNER
        try {
            await sendApplicationReceivedEmail(application, project, reviewer);
            console.log('✓ Application received email sent to owner');
        } catch (emailError) {
            console.error('Email error (non-blocking):', emailError);
        }

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: application
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'You have already applied to this project'
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

// Approve application
router.put('/:id/approve', requireAuth, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }

        if (application.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: 'Application has already been reviewed'
            });
        }

        application.status = 'approved';
        application.reviewedAt = new Date();
        await application.save();

        await Project.findByIdAndUpdate(application.projectId, {
            $inc: { approvedCount: 1 }
        });

        // Get reviewer and project for email
        const reviewer = await Reviewer.findById(application.reviewerId);
        const project = await Project.findById(application.projectId);

        // 📧 SEND APPROVAL EMAIL TO REVIEWER
        try {
            await sendApplicationApprovedEmail(reviewer, project);
            console.log('✓ Application approved email sent to reviewer');
        } catch (emailError) {
            console.error('Email error (non-blocking):', emailError);
        }

        res.json({
            success: true,
            message: 'Application approved',
            data: application
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Reject application
router.put('/:id/reject', requireAuth, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }

        if (application.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: 'Application has already been reviewed'
            });
        }

        application.status = 'rejected';
        application.reviewedAt = new Date();
        await application.save();

        // Get reviewer and project for email
        const reviewer = await Reviewer.findById(application.reviewerId);
        const project = await Project.findById(application.projectId);

        // 📧 SEND REJECTION EMAIL TO REVIEWER
        try {
            await sendApplicationRejectedEmail(reviewer, project);
            console.log('✓ Application rejected email sent to reviewer');
        } catch (emailError) {
            console.error('Email error (non-blocking):', emailError);
        }

        res.json({
            success: true,
            message: 'Application rejected',
            data: application
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;