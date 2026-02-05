import express from 'express';
import Project from '../models/Project.js';
import Application from '../models/Application.js';
import { requireAuth, getUserId } from '../middleware/auth.js';
import { sendProjectSubmittedEmail } from '../services/emailService.js';

const router = express.Router();

// Get all projects with filters
router.get('/', async (req, res) => {
    try {
        const { type, minXP, owner, page = 1, limit = 12, sort = 'newest' } = req.query;
        let query = {};

        if (type) query.type = type;
        if (minXP) query.xpReward = { $gte: parseInt(minXP) };
        if (owner) query.ownerName = new RegExp(owner, 'i');

        let sortOption = {};
        switch (sort) {
            case 'newest':
                sortOption = { createdAt: -1 };
                break;
            case 'oldest':
                sortOption = { createdAt: 1 };
                break;
            case 'highestXP':
                sortOption = { xpReward: -1 };
                break;
            case 'lowestXP':
                sortOption = { xpReward: 1 };
                break;
            case 'mostApplicants':
                sortOption = { applicantsCount: -1 };
                break;
            default:
                sortOption = { createdAt: -1 };
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const projects = await Project.find(query)
            .sort(sortOption)
            .limit(limitNum)
            .skip(skip);

        const totalProjects = await Project.countDocuments(query);
        const totalPages = Math.ceil(totalProjects / limitNum);

        res.json({
            success: true,
            count: projects.length,
            total: totalProjects,
            page: pageNum,
            totalPages: totalPages,
            hasMore: pageNum < totalPages,
            data: projects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.get('/available', async (req, res) => {
    const { reviewerId } = req.query;
    
    const myApps = await Application.find({ reviewerId }).select('projectId');
    const appliedIds = myApps.map(app => app.projectId.toString());
    
    const projects = await Project.find({
        status: 'pending',
        _id: { $nin: appliedIds }
    });
    
    res.json({ success: true, projects });
});

// Get single project
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }

        res.json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create project
router.post('/', requireAuth, async (req, res) => {
    try {
        const userId = getUserId(req);
        
        const projectData = {
            ...req.body,
            ownerId: userId
        };

        const project = await Project.create(projectData);

        // 📧 SEND PROJECT SUBMITTED EMAIL
        try {
            await sendProjectSubmittedEmail(project);
            console.log('✓ Project submitted email sent');
        } catch (emailError) {
            console.error('Email error (non-blocking):', emailError);
        }

        res.status(201).json({
            success: true,
            message: 'Project uploaded successfully',
            data: project
        });
    } catch (error) {
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

// ✅ FIX 3: EDIT PROJECT
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const userId = getUserId(req);
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }

        // Verify ownership
        if (project.ownerId !== userId) {
            return res.status(403).json({
                success: false,
                error: 'You can only edit your own projects'
            });
        }

        // Update allowed fields
        const allowedUpdates = ['title', 'description', 'type', 'link', 'xpReward', 'reviewersNeeded', 'deadline', 'reviewFocusAreas'];
        const updates = {};
        
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Project updated successfully',
            data: updatedProject
        });
    } catch (error) {
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

// ✅ FIX 3: DELETE PROJECT
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const userId = getUserId(req);
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }

        // Verify ownership
        if (project.ownerId !== userId) {
            return res.status(403).json({
                success: false,
                error: 'You can only delete your own projects'
            });
        }

        // Check if project has approved applications
        const Application = (await import('../models/Application.js')).default;
        const approvedCount = await Application.countDocuments({
            projectId: project._id,
            status: 'approved'
        });

        if (approvedCount > 0) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete project with approved reviewers. Please complete the review process first.'
            });
        }

        await Project.findByIdAndDelete(req.params.id);

        // Delete related applications
        await Application.deleteMany({ projectId: req.params.id });

        res.json({
            success: true,
            message: 'Project deleted successfully',
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get project details (full access only if approved)
router.get('/:id/full', requireAuth, async (req, res) => {
    try {
        const userId = getUserId(req);
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }

        // Check if user is owner or approved reviewer
        const isOwner = project.ownerId === userId;
        
        let isApproved = false;
        if (!isOwner) {
            const Reviewer = (await import('../models/Reviewer.js')).default;
            const Application = (await import('../models/Application.js')).default;
            
            const reviewer = await Reviewer.findOne({ userId });
            if (reviewer) {
                const application = await Application.findOne({
                    projectId: project._id,
                    reviewerId: reviewer._id,
                    status: 'approved'
                });
                isApproved = !!application;
            }
        }

        if (!isOwner && !isApproved) {
            return res.status(403).json({
                success: false,
                error: 'You must be approved to view full project details'
            });
        }

        res.json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;