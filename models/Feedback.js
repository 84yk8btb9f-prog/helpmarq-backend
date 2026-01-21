import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reviewer',
        required: true,
        index: true  // ← Add for querying
    },
    reviewerUsername: {
        type: String,
        required: true
    },
    feedbackText: {
        type: String,
        required: true,
        minlength: 50,
        maxlength: 2000
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

feedbackSchema.index({ projectId: 1, reviewerId: 1 }, { unique: true });
// REMOVE: feedbackSchema.index({ reviewerId: 1 });

export default mongoose.model('Feedback', feedbackSchema);