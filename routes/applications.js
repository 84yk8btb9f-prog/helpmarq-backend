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

// Get applications for a project
router.get('/project/:projectId', requireAuth, async (req, res) => {
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
        console.error('Get applications error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ✅ FIX ISSUE 2: Get applications by reviewer - NOW INCLUDES FULL PROJECT DETAILS
router.get('/reviewer/:reviewerId', requireAuth, async (req, res) => {
    try {
        const applications = await Application.find({ 
            reviewerId: req.params.reviewerId 
        })
        .populate('projectId') // ✅ FIX: Populate ALL fields (includes description + link for approved reviewers)
        .sort({ appliedAt: -1 });

        res.json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        console.error('Get reviewer applications error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create application
router.post('/', requireAuth, async (req, res) => {
    try {
        const { projectId, reviewerId, reviewerUsername, qualifications, focusAreas } = req.body;

        // Validation
        if (!projectId || !reviewerId || !reviewerUsername || !qualifications || !focusAreas) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required'
            });
        }

        // Verify project exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }

        // Verify reviewer exists
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
            applicantIp
        });

        // Update project applicant count
        await Project.findByIdAndUpdate(projectId, {
            $inc: { applicantsCount: 1 }
        });

        // Send email notification to OWNER
        try {
            console.log('Sending application email to OWNER:', project.ownerEmail);
            
            await sendApplicationReceivedEmail(
                project.ownerEmail,
                {
                    ownerName: project.ownerName,
                    reviewerName: reviewer.username,
                    projectTitle: project.title
                }
            );
            
            console.log('✅ Application email sent to owner');
        } catch (emailError) {
            console.error('❌ Email error (non-blocking):', emailError);
        }

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: application
        });
    } catch (error) {
        console.error('Create application error:', error);
        
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

// APPROVE APPLICATION
router.put('/:applicationId/approve', requireAuth, async (req, res) => {
    try {
        const { applicationId } = req.params;
        
        console.log('✅ Approving application:', applicationId);
        
        // Get application with populated project
        const application = await Application.findById(applicationId)
            .populate('projectId');
        
        if (!application) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }
        
        // Update status
        application.status = 'approved';
        application.reviewedAt = new Date();
        await application.save();
        
        console.log('✅ Application status updated to approved');
        
        // Get reviewer data
        try {
            const reviewer = await Reviewer.findById(application.reviewerId);
            
            if (reviewer && reviewer.email) {
                await sendApplicationApprovedEmail(
                    reviewer.email,
                    {
                        reviewerName: reviewer.username,
                        projectTitle: application.projectId.title
                    }
                );
                console.log('✅ Approval email sent to:', reviewer.email);
            } else {
                console.error('❌ Could not find reviewer email');
            }
        } catch (emailError) {
            console.error('❌ Email failed (non-blocking):', emailError);
        }
        
        // Update project approved count
        await Project.findByIdAndUpdate(application.projectId._id, {
            $inc: { approvedCount: 1 }
        });
        
        res.json({
            success: true,
            message: 'Application approved',
            application
        });
        
    } catch (error) {
        console.error('❌ Approve error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// REJECT APPLICATION
router.put('/:applicationId/reject', requireAuth, async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { reason } = req.body;
        
        console.log('✅ Rejecting application:', applicationId);
        
        // Get application with populated project
        const application = await Application.findById(applicationId)
            .populate('projectId');
        
        if (!application) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }
        
        // Update status
        application.status = 'rejected';
        application.rejectionReason = reason || 'Not a good fit for this project';
        application.reviewedAt = new Date();
        await application.save();
        
        console.log('✅ Application status updated to rejected');
        
        // Get reviewer data
        try {
            const reviewer = await Reviewer.findById(application.reviewerId);
            
            if (reviewer && reviewer.email) {
                await sendApplicationRejectedEmail(
                    reviewer.email,
                    {
                        reviewerName: reviewer.username,
                        project: application.projectId ? {
                            title: application.projectId.title
                        } : null,
                        reason: application.rejectionReason
                    }
                );
                console.log('✅ Rejection email sent to:', reviewer.email);
            } else {
                console.error('❌ Could not find reviewer email');
            }
        } catch (emailError) {
            console.error('❌ Email failed (non-blocking):', emailError);
        }
        
        res.json({
            success: true,
            message: 'Application rejected',
            application
        });
        
    } catch (error) {
        console.error('❌ Reject error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;