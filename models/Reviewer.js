const mongoose = require('mongoose');

const reviewerSchema = new mongoose.Schema({
    clerkUserId: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: [true, 'Display name is required'],
        trim: true,
        minlength: [3, 'Display name must be at least 3 characters'],
        maxlength: [50, 'Display name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true
    },
    expertise: {
        type: String,
        required: [true, 'Expertise is required'],
        enum: {
            values: ['UI/UX Design', 'Web Development', 'Mobile Development', 'Graphic Design', 'Product Management', 'Marketing', 'Copywriting', 'Business Strategy', 'Data Analysis', 'Other'],
            message: '{VALUE} is not a valid expertise'
        }
    },
    experience: {
        type: String,
        required: [true, 'Experience level is required'],
        enum: {
            values: ['0-1', '1-3', '3-5', '5-10', '10+'],
            message: '{VALUE} is not a valid experience level'
        }
    },
    portfolio: {
        type: String,
        default: '',
        trim: true
    },
    bio: {
        type: String,
        required: [true, 'Bio is required'],
        minlength: [50, 'Bio must be at least 50 characters'],
        maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    level: {
        type: Number,
        default: 1,
        min: 1,
        max: 10
    },
    xp: {
        type: Number,
        default: 0,
        min: 0
    },
    totalReviews: {
        type: Number,
        default: 0,
        min: 0
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    }
}, {
    timestamps: true
});

reviewerSchema.methods.updateLevel = function() {
    if (this.xp >= 2500) this.level = 6;
    else if (this.xp >= 2000) this.level = 5;
    else if (this.xp >= 1500) this.level = 4;
    else if (this.xp >= 1000) this.level = 3;
    else if (this.xp >= 500) this.level = 2;
    else this.level = 1;
};

module.exports = mongoose.model('Reviewer', reviewerSchema);