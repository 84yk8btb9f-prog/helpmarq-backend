const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Reviewer = require('../models/Reviewer');
const Application = require('../models/Application');
const Feedback = require('../models/Feedback');

// Get platform statistics
router.get('/', async (req, res) => {
    try {
        // Total counts
        const totalProjects = await Project.countDocuments();
        const totalReviewers = await Reviewer.countDocuments();
        const totalApplications = await Application.countDocuments();
        const totalFeedback = await Feedback.countDocuments();
        
        // Active projects (have applications)
        const activeProjects = await Project.countDocuments({ applicantsCount: { $gt: 0 } });
        
        // Approved applications
        const approvedApplications = await Application.countDocuments({ status: 'approved' });
        
        // Average ratings
        const reviewersWithRatings = await Reviewer.find({ totalReviews: { $gt: 0 } });
        const avgPlatformRating = reviewersWithRatings.length > 0
            ? reviewersWithRatings.reduce((sum, r) => sum + r.averageRating, 0) / reviewersWithRatings.length
            : 0;
        
        // Total XP awarded
        const allReviewers = await Reviewer.find();
        const totalXPAwarded = allReviewers.reduce((sum, r) => sum + r.xp, 0);
        
        // Top reviewer
        const topReviewer = await Reviewer.findOne().sort({ xp: -1 }).limit(1);
        
        // Recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentProjects = await Project.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
        const recentApplications = await Application.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
        const recentFeedback = await Feedback.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
        
        // Project type distribution
        const projectTypes = await Project.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);
        
        res.json({
            success: true,
            data: {
                totals: {
                    projects: totalProjects,
                    reviewers: totalReviewers,
                    applications: totalApplications,
                    feedback: totalFeedback,
                    activeProjects: activeProjects,
                    approvedApplications: approvedApplications
                },
                quality: {
                    avgPlatformRating: avgPlatformRating.toFixed(2),
                    totalXPAwarded: totalXPAwarded,
                    topReviewer: topReviewer ? {
                        username: topReviewer.username,
                        xp: topReviewer.xp,
                        level: topReviewer.level
                    } : null
                },
                activity: {
                    last7Days: {
                        projects: recentProjects,
                        applications: recentApplications,
                        feedback: recentFeedback
                    }
                },
                distribution: {
                    projectTypes: projectTypes
                }
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