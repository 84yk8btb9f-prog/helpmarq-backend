import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['owner', 'reviewer'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.model('UserProfile', userProfileSchema);