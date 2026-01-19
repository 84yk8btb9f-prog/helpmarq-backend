import express from 'express';
import Reviewer from '../models/Reviewer.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = 'xp' } = req.query;

        let sortOption = {};
        switch (sort) {
            case 'xp':
                sortOption = { xp: -1 };
                break;
            case 'level':
                sortOption = { level: -1, xp: -1 };
                break;
            case 'reviews':
                sortOption = { totalReviews: -1 };
                break;
            case 'rating':
                sortOption = { averageRating: -1 };
                break;
            case 'newest':
                sortOption = { createdAt: -1 };
                break;
            default:
                sortOption = { xp: -1 };
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const reviewers = await Reviewer.find()
            .sort(sortOption)
            .limit(limitNum)
            .skip(skip);

        const totalReviewers = await Reviewer.countDocuments();
        const totalPages = Math.ceil(totalReviewers / limitNum);

        res.json({
            success: true,
            count: reviewers.length,
            total: totalReviewers,
            page: pageNum,
            totalPages: totalPages,
            hasMore: pageNum < totalPages,
            data: reviewers
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
        const reviewer = await Reviewer.findById(req.params.id);

        if (!reviewer) {
            return res.status(404).json({
                success: false,
                error: 'Reviewer not found'
            });
        }

        res.json({
            success: true,
            data: reviewer
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const reviewer = await Reviewer.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Reviewer created',
            data: reviewer
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: errors[0]
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Username or email already exists'
            });
        }

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;