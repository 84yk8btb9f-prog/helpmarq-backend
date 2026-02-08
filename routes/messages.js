import express from 'express';
import Message from '../models/Message.js';
import Application from '../models/Application.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all messages for an application
router.get('/:applicationId', requireAuth, async (req, res) => {
    try {
        const { applicationId } = req.params;
        
        // Verify application exists and user has access
        const application = await Application.findById(applicationId)
            .populate('projectId', 'ownerId')
            .populate('reviewerId', 'userId');
        
        if (!application) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }
        
        // Check if approved
        if (application.status !== 'approved') {
            return res.status(403).json({
                success: false,
                error: 'Messaging only available for approved applications'
            });
        }
        
        // Check access (owner or reviewer)
        const isOwner = application.projectId.ownerId === req.user.id;
        const isReviewer = application.reviewerId?.userId === req.user.id;
        
        if (!isOwner && !isReviewer) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }
        
        // Get messages
        const messages = await Message.find({ applicationId })
            .sort({ createdAt: 1 })
            .lean();
        
        // Mark messages as read if they're for this user
        const userRole = isOwner ? 'owner' : 'reviewer';
        const unreadIds = messages
            .filter(m => m.senderRole !== userRole && !m.read)
            .map(m => m._id);
        
        if (unreadIds.length > 0) {
            await Message.updateMany(
                { _id: { $in: unreadIds } },
                { $set: { read: true } }
            );
        }
        
        res.json({
            success: true,
            data: messages,
            userRole
        });
        
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Send a message
router.post('/', requireAuth, async (req, res) => {
    try {
        const { applicationId, text } = req.body;
        
        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Message text required'
            });
        }
        
        if (text.length > 1000) {
            return res.status(400).json({
                success: false,
                error: 'Message too long (max 1000 characters)'
            });
        }
        
        // Verify application and access
        const application = await Application.findById(applicationId)
            .populate('projectId', 'ownerId ownerName')
            .populate('reviewerId', 'userId username');
        
        if (!application) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }
        
        if (application.status !== 'approved') {
            return res.status(403).json({
                success: false,
                error: 'Messaging only available for approved applications'
            });
        }
        
        const isOwner = application.projectId.ownerId === req.user.id;
        const isReviewer = application.reviewerId?.userId === req.user.id;
        
        if (!isOwner && !isReviewer) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }
        
        // Create message
        const message = await Message.create({
            applicationId,
            senderId: req.user.id,
            senderRole: isOwner ? 'owner' : 'reviewer',
            senderName: isOwner ? application.projectId.ownerName : application.reviewerId.username,
            text: text.trim(),
            read: false,
            emailSent: false
        });
        
        res.status(201).json({
            success: true,
            data: message
        });
        
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get unread count for user's applications
router.get('/unread/count', requireAuth, async (req, res) => {
    try {
        // Get user's applications (as owner or reviewer)
        const ownerApplications = await Application.find({
            status: 'approved'
        })
        .populate('projectId', 'ownerId')
        .lean();
        
        const reviewerApplications = await Application.find({
            status: 'approved'
        })
        .populate('reviewerId', 'userId')
        .lean();
        
        const userOwnerApps = ownerApplications
            .filter(app => app.projectId.ownerId === req.user.id)
            .map(app => app._id);
        
        const userReviewerApps = reviewerApplications
            .filter(app => app.reviewerId?.userId === req.user.id)
            .map(app => app._id);
        
        // Count unread messages
        const ownerUnread = await Message.countDocuments({
            applicationId: { $in: userOwnerApps },
            senderRole: 'reviewer',
            read: false
        });
        
        const reviewerUnread = await Message.countDocuments({
            applicationId: { $in: userReviewerApps },
            senderRole: 'owner',
            read: false
        });
        
        res.json({
            success: true,
            data: {
                total: ownerUnread + reviewerUnread,
                byApplication: {} // Could expand this if needed
            }
        });
        
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;