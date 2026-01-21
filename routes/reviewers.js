import express from 'express';
import Reviewer from '../models/Reviewer.js';

const router = express.Router();

// Get all reviewers with sorting and pagination
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
        console.error('Get reviewers error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get single reviewer
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
        console.error('Get reviewer error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;