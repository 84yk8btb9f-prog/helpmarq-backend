import mongoose from 'mongoose';

const reviewerSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    expertise: {
        type: String,
        required: true,
        enum: ['UI/UX Design', 'Web Development', 'Mobile Development', 'Graphic Design', 'Product Management', 'Marketing', 'Copywriting', 'Business Strategy', 'Data Analysis', 'Other']
    },
    experience: {
        type: String,
        required: true,
        enum: ['0-1', '1-3', '3-5', '5-10', '10+']
    },
    portfolio: {
        type: String,
        default: '',
        trim: true
    },
    bio: {
        type: String,
        required: true,
        minlength: 50,
        maxlength: 500
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

// Only these indexes
reviewerSchema.index({ xp: -1, level: -1 });

reviewerSchema.methods.updateLevel = function() {
    if (this.xp >= 2500) this.level = 6;
    else if (this.xp >= 2000) this.level = 5;
    else if (this.xp >= 1500) this.level = 4;
    else if (this.xp >= 1000) this.level = 3;
    else if (this.xp >= 500) this.level = 2;
    else this.level = 1;
};

export default mongoose.model('Reviewer', reviewerSchema);