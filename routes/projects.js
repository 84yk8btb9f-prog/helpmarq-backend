const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { requireAuth, getUserId } = require('../middleware/auth');

router.get('/', async (req, res) => {
    try {
        const { type, minXP, owner, page = 1, limit = 12, sort = 'newest' } = req.query;
        let query = {};

        if (type) query.type = type;
        if (minXP) query.xpReward = { $gte: parseInt(minXP) };
        if (owner) query.ownerName = new RegExp(owner, 'i');

        // Sorting
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

        // Pagination
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

router.post('/', requireAuth, async (req, res) => {
try {
         // Send welcome email to first-time owners
        const { sendEmail } = require('../services/emailService');
        const ownerProjectCount = await Project.countDocuments({ ownerId: project.ownerId });
        
        if (ownerProjectCount === 1) {
            // First project - send welcome email
            await sendEmail('welcomeOwner', project.ownerEmail || req.body.ownerEmail, {
                name: project.ownerName
            });
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

router.delete('/:id', requireAuth, async (req, res) => {
try {
        const project = await Project.findByIdAndDelete(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }

        res.json({
            success: true,
            message: 'Project deleted',
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;