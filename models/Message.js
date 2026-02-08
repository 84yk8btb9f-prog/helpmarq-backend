import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        required: true,
        index: true
    },
    senderId: {
        type: String,  // Better Auth user ID
        required: true
    },
    senderRole: {
        type: String,
        enum: ['owner', 'reviewer'],
        required: true
    },
    senderName: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 1000
    },
    read: {
        type: Boolean,
        default: false
    },
    emailSent: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
messageSchema.index({ applicationId: 1, createdAt: 1 });

export default mongoose.model('Message', messageSchema);