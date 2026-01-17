const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reviewer',
        required: true
    },
    reviewerUsername: {
        type: String,
        required: true
    },
    feedbackText: {
        type: String,
        required: [true, 'Feedback text is required'],
        minlength: [50, 'Feedback must be at least 50 characters'],
        maxlength: [2000, 'Feedback cannot exceed 2000 characters']
    },
    projectRating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
    },
    ownerRating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
    },
    xpAwarded: {
        type: Number,
        default: 0
    },
    isRated: {
        type: Boolean,
        default: false
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    ratedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Prevent duplicate feedback (same reviewer can only review project once)
feedbackSchema.index({ projectId: 1, reviewerId: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);