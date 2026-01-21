import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
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
    qualifications: {
        type: String,
        required: true,
        minlength: 20,
        maxlength: 500
    },
    focusAreas: {
        type: String,
        required: true,
        minlength: 20,
        maxlength: 500
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

applicationSchema.index({ projectId: 1, reviewerId: 1 }, { unique: true });
// REMOVE: applicationSchema.index({ reviewerId: 1 });

export default mongoose.model('Application', applicationSchema);