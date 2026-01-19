import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        minlength: [5, 'Title must be at least 5 characters'],
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        minlength: [20, 'Description must be at least 20 characters'],
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    type: {
        type: String,
        required: [true, 'Project type is required'],
        enum: {
            values: ['website', 'app', 'design', 'pitch', 'business', 'other'],
            message: '{VALUE} is not a valid project type'
        }
    },
    link: {
        type: String,
        required: [true, 'Project link is required'],
        trim: true
    },
    imageUrl: {
        type: String,
        default: null
    },
    ownerId: {
        type: String,
        required: [true, 'Owner ID is required']
    },
    ownerName: {
        type: String,
        required: [true, 'Owner name is required'],
        trim: true
    },
    ownerEmail: {
        type: String,
        required: [true, 'Owner email is required'],
        trim: true,
        lowercase: true
    },
    xpReward: {
        type: Number,
        required: [true, 'XP reward is required'],
        min: [50, 'XP reward must be at least 50'],
        max: [500, 'XP reward cannot exceed 500']
    },
    deadline: {
        type: Date,
        required: [true, 'Deadline is required'],
        validate: {
            validator: function(value) {
                return value > new Date();
            },
            message: 'Deadline must be in the future'
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

export default mongoose.models.Project || mongoose.model('Project', projectSchema);