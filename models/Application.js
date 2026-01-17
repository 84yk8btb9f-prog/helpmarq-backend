const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
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
    qualifications: {
        type: String,
        required: [true, 'Please explain why you are qualified'],
        minlength: [20, 'Qualifications must be at least 20 characters'],
        maxlength: [500, 'Qualifications cannot exceed 500 characters']
    },
    focusAreas: {
        type: String,
        required: [true, 'Please specify what you will focus on'],
        minlength: [20, 'Focus areas must be at least 20 characters'],
        maxlength: [500, 'Focus areas cannot exceed 500 characters']
    },
    ndaAccepted: {
        type: Boolean,
        required: true,
        default: false
    },
    ndaAcceptedAt: {
        type: Date,
        default: null
    },
    applicantIp: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    appliedAt: {
        type: Date,
        default: Date.now
    },
    reviewedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Prevent duplicate applications (same reviewer + project)
applicationSchema.index({ projectId: 1, reviewerId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);