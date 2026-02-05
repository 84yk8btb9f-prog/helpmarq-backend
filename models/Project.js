// UPDATED PROJECT SCHEMA
// File: backend/models/Project.js
// Add the reviewFocusAreas field to the schema

import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 20,
        maxlength: 500
    },
    type: {
        type: String,
        required: true,
        enum: ['website', 'app', 'design', 'pitch', 'business', 'other']
    },
    link: {
        type: String,
        required: true,
        trim: true
    },
    imageUrl: {
        type: String,
        default: null
    },
    ownerId: {
        type: String,
        required: true,
        index: true
    },
    ownerName: {
        type: String,
        required: true,
        trim: true
    },
    ownerEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    xpReward: {
        type: Number,
        required: true,
        min: 50,
        max: 500,
        index: true
    },
    deadline: {
        type: Date,
        required: true
    },
    // ✅ NEW FIELD: Review Focus Areas
    reviewFocusAreas: {
        type: [String],
        default: [],
        validate: {
            validator: function(v) {
                return v.length >= 1 && v.length <= 8;
            },
            message: 'Please select between 1 and 8 focus areas'
        }
    },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'completed', 'closed'],
        default: 'open'
    },
    applicantsCount: {
        type: Number,
        default: 0
    },
    approvedCount: {
        type: Number,
        default: 0
    },
    reviewsCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

export default mongoose.model('Project', projectSchema);