const express = require('express');
const router = express.Router();
const { requireAuth, getUserId } = require('../middleware/auth');
const Application = require('../models/Application');
const Feedback = require('../models/Feedback');
const Project = require('../models/Project');

// Get notifications for current user
router.get('/', requireAuth, async (req, res) => {
    try {
        const userId = getUserId(req);
        
        const notifications = {
            owner: {
                newApplicants: 0,
                newFeedback: 0,
                unratedFeedback: 0
            },
            reviewer: {
                applicationApproved: 0,
                applicationRejected: 0,
                feedbackRated: 0
            }
        };
        
        // Check if user owns any projects
        const ownedProjects = await Project.find({ ownerId: userId });
        
        if (ownedProjects.length > 0) {
            const projectIds = ownedProjects.map(p => p._id);
            
            // New applicants (pending status)
            notifications.owner.newApplicants = await Application.countDocuments({
                projectId: { $in: projectIds },
                status: 'pending'
            });
            
            // Unrated feedback
            notifications.owner.unratedFeedback = await Feedback.countDocuments({
                projectId: { $in: projectIds },
                isRated: false
            });
            
            // New feedback (submitted in last 7 days and not rated)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            notifications.owner.newFeedback = await Feedback.countDocuments({
                projectId: { $in: projectIds },
                submittedAt: { $gte: sevenDaysAgo },
                isRated: false
            });
        }
        
        // Check if user is a reviewer
        const Reviewer = require('../models/Reviewer');
        const reviewer = await Reviewer.findOne({ clerkUserId: userId });
        
        if (reviewer) {
            // Recently approved applications (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            notifications.reviewer.applicationApproved = await Application.countDocuments({
                reviewerId: reviewer._id,
                status: 'approved',
                reviewedAt: { $gte: sevenDaysAgo }
            });
            
            // Recently rejected
            notifications.reviewer.applicationRejected = await Application.countDocuments({
                reviewerId: reviewer._id,
                status: 'rejected',
                reviewedAt: { $gte: sevenDaysAgo }
            });
            
            // Feedback rated in last 7 days
            notifications.reviewer.feedbackRated = await Feedback.countDocuments({
                reviewerId: reviewer._id,
                isRated: true,
                ratedAt: { $gte: sevenDaysAgo }
            });
        }
        
        res.json({
            success: true,
            data: notifications
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;