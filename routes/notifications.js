import express from 'express';
import Application from '../models/Application.js';
import Feedback from '../models/Feedback.js';
import Project from '../models/Project.js';
import Reviewer from '../models/Reviewer.js';
import { requireAuth, getUserId } from '../middleware/auth.js';

const router = express.Router();

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
        
        // Check for owned projects
        const ownedProjects = await Project.find({ ownerId: userId });
        
        if (ownedProjects.length > 0) {
            const projectIds = ownedProjects.map(p => p._id);
            
            notifications.owner.newApplicants = await Application.countDocuments({
                projectId: { $in: projectIds },
                status: 'pending'
            });
            
            notifications.owner.unratedFeedback = await Feedback.countDocuments({
                projectId: { $in: projectIds },
                isRated: false
            });
            
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            notifications.owner.newFeedback = await Feedback.countDocuments({
                projectId: { $in: projectIds },
                submittedAt: { $gte: sevenDaysAgo },
                isRated: false
            });
        }
        
        // Check for reviewer profile
        const reviewer = await Reviewer.findOne({ userId });
        
        if (reviewer) {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            notifications.reviewer.applicationApproved = await Application.countDocuments({
                reviewerId: reviewer._id,
                status: 'approved',
                reviewedAt: { $gte: sevenDaysAgo }
            });
            
            notifications.reviewer.applicationRejected = await Application.countDocuments({
                reviewerId: reviewer._id,
                status: 'rejected',
                reviewedAt: { $gte: sevenDaysAgo }
            });
            
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
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;