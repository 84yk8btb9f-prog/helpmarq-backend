import express from 'express';
import { requireAuth, getUserId } from '../middleware/auth.js';
import Reviewer from '../models/Reviewer.js';
import Project from '../models/Project.js';
import UserProfile from '../models/UserProfile.js';
import { sendWelcomeEmail } from '../services/emailService.js';

const router = express.Router();

// ✅ FIX: Get current user info and role (checks UserProfile first)
router.get('/me', requireAuth, async (req, res) => {
    try {
        const userId = getUserId(req);

        // ✅ FIX: Check UserProfile FIRST (most reliable)
        const userProfile = await UserProfile.findOne({ userId });
        if (userProfile) {
            console.log('✓ Found user profile with role:', userProfile.role);
            
            if (userProfile.role === 'reviewer') {
                const reviewer = await Reviewer.findOne({ userId });
                return res.json({
                    success: true,
                    role: 'reviewer',
                    data: reviewer || { userId }
                });
            } else {
                return res.json({
                    success: true,
                    role: 'owner',
                    data: { userId }
                });
            }
        }

        // Fallback: Check if reviewer exists (for users created before UserProfile)
        const reviewer = await Reviewer.findOne({ userId });
        if (reviewer) {
            // Create UserProfile for existing reviewer
            await UserProfile.create({
                userId,
                email: reviewer.email,
                name: reviewer.username,
                role: 'reviewer'
            });
            
            return res.json({
                success: true,
                role: 'reviewer',
                data: reviewer
            });
        }

        // Fallback: Check if user has projects (for existing owners)
        const projects = await Project.find({ ownerId: userId });
        if (projects.length > 0) {
            // Create UserProfile for existing owner
            await UserProfile.create({
                userId,
                email: projects[0].ownerEmail,
                name: projects[0].ownerName,
                role: 'owner'
            });
            
            return res.json({
                success: true,
                role: 'owner',
                data: { userId, projectCount: projects.length }
            });
        }

        // New user, no role yet
        console.log('No role found for user:', userId);
        res.json({
            success: true,
            role: null,
            data: { userId }
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ✅ NEW: Set owner role (called from role-select.html)
router.post('/set-owner-role', requireAuth, async (req, res) => {
    try {
        const userId = getUserId(req);
        const user = req.user; // From Better Auth session
        
        console.log('Setting owner role for user:', userId);
        
        // Check if profile already exists
        const existing = await UserProfile.findOne({ userId });
        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'User role already set'
            });
        }
        
        // Create UserProfile
        const profile = await UserProfile.create({
            userId,
            email: user.email,
            name: user.name || user.email,
            role: 'owner'
        });
        
        console.log('✓ Owner role saved to database');
        
        // Send welcome email
        try {
            await sendWelcomeEmail({ email: user.email, name: user.name }, 'owner');
            console.log('✓ Welcome email sent');
        } catch (emailError) {
            console.error('❌ Welcome email failed (non-blocking):', emailError);
        }
        
        res.json({
            success: true,
            message: 'Owner role set',
            data: profile
        });
        
    } catch (error) {
        console.error('Set owner role error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create reviewer profile
router.post('/create-reviewer', requireAuth, async (req, res) => {
    try {
        const userId = getUserId(req);
        const { username, email, expertise, experience, portfolio, bio } = req.body;

        // Validation
        if (!username || username.length < 3) {
            return res.status(400).json({
                success: false,
                error: 'Username must be at least 3 characters'
            });
        }

        if (!expertise) {
            return res.status(400).json({
                success: false,
                error: 'Expertise is required'
            });
        }

        if (!experience) {
            return res.status(400).json({
                success: false,
                error: 'Experience level is required'
            });
        }

        if (!bio || bio.length < 50) {
            return res.status(400).json({
                success: false,
                error: 'Bio must be at least 50 characters'
            });
        }

        // Check if reviewer already exists
        const existing = await Reviewer.findOne({ userId });
        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'Reviewer profile already exists'
            });
        }

        // Create reviewer
        const reviewer = await Reviewer.create({
            userId,
            username,
            email,
            expertise,
            experience,
            portfolio: portfolio || '',
            bio
        });
        
        // ✅ FIX: Create UserProfile too
        await UserProfile.create({
            userId,
            email,
            name: username,
            role: 'reviewer'
        });
        
        console.log('✓ Reviewer profile and UserProfile created');

        // Send welcome email
        try {
            console.log('Sending welcome email to:', email);
            await sendWelcomeEmail({ email, name: username }, 'reviewer');
            console.log('✓ Welcome email sent successfully');
        } catch (emailError) {
            console.error('❌ Welcome email failed (non-blocking):', emailError);
        }

        res.status(201).json({
            success: true,
            message: 'Reviewer profile created',
            data: reviewer
        });

    } catch (error) {
        console.error('Create reviewer error:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: errors[0]
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Username already taken'
            });
        }

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
router.options('/update-profile', (req, res) => {
    res.status(200).end();
});
// Update profile (for reviewers and owners)
router.patch('/update-profile', requireAuth, async (req, res) => {
    try {
        const userId = getUserId(req);
        
        // Get current user profile to determine role
        const userProfile = await UserProfile.findOne({ userId });
        if (!userProfile) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found'
            });
        }

        if (userProfile.role === 'reviewer') {
            // Update reviewer profile
            const { username, bio, expertise, experience, portfolio } = req.body;
            const updates = {};

            // Validate and build update object
            if (username !== undefined) {
                if (username.length < 3 || username.length > 50) {
                    return res.status(400).json({
                        success: false,
                        error: 'Username must be between 3 and 50 characters'
                    });
                }
                
                // Check if username is taken by another user
                const existingUsername = await Reviewer.findOne({ 
                    username, 
                    userId: { $ne: userId } 
                });
                if (existingUsername) {
                    return res.status(400).json({
                        success: false,
                        error: 'Username already taken'
                    });
                }
                
                updates.username = username;
            }

            // Bio is optional - no minimum validation

            if (expertise !== undefined) {
                const validExpertise = ['UI/UX Design', 'Web Development', 'Mobile Development', 
                    'Graphic Design', 'Product Management', 'Marketing', 'Copywriting', 
                    'Business Strategy', 'Data Analysis', 'Other'];
                if (!validExpertise.includes(expertise)) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid expertise'
                    });
                }
                updates.expertise = expertise;
            }

            if (experience !== undefined) {
                const validExperience = ['0-1', '1-3', '3-5', '5-10', '10+'];
                if (!validExperience.includes(experience)) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid experience level'
                    });
                }
                updates.experience = experience;
            }

            if (portfolio !== undefined) {
                updates.portfolio = portfolio.trim();
            }

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No valid fields to update'
                });
            }

            // Update reviewer document
            const reviewer = await Reviewer.findOneAndUpdate(
                { userId },
                { $set: updates },
                { new: true, runValidators: true }
            );

            if (!reviewer) {
                return res.status(404).json({
                    success: false,
                    error: 'Reviewer profile not found'
                });
            }

            // Update UserProfile name if username changed
            if (updates.username) {
                await UserProfile.findOneAndUpdate(
                    { userId },
                    { $set: { name: updates.username } }
                );
            }

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: reviewer
            });

        } else if (userProfile.role === 'owner') {
            // Update owner profile (limited fields)
            const { name } = req.body;
            
            if (!name || name.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    error: 'Name must be at least 2 characters'
                });
            }

            // Update UserProfile
            const updated = await UserProfile.findOneAndUpdate(
                { userId },
                { $set: { name: name.trim() } },
                { new: true }
            );

            // Update all projects with new owner name
            await Project.updateMany(
                { ownerId: userId },
                { $set: { ownerName: name.trim() } }
            );

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: updated
            });
        }

    } catch (error) {
        console.error('Update profile error:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Username already taken'
            });
        }

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ADD THIS TO: backend/routes/auth.js
// Insert after the /create-reviewer route

// Update profile (for reviewers and owners)
router.patch('/update-profile', requireAuth, async (req, res) => {
    try {
        const userId = getUserId(req);
        
        // Get current user profile to determine role
        const userProfile = await UserProfile.findOne({ userId });
        if (!userProfile) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found'
            });
        }

        if (userProfile.role === 'reviewer') {
            // Update reviewer profile
            const { username, bio, expertise, experience, portfolio } = req.body;
            const updates = {};

            // Validate and build update object
            if (username !== undefined) {
                if (username.length < 3 || username.length > 50) {
                    return res.status(400).json({
                        success: false,
                        error: 'Username must be between 3 and 50 characters'
                    });
                }
                
                // Check if username is taken by another user
                const existingUsername = await Reviewer.findOne({ 
                    username, 
                    userId: { $ne: userId } 
                });
                if (existingUsername) {
                    return res.status(400).json({
                        success: false,
                        error: 'Username already taken'
                    });
                }
                
                updates.username = username;
            }

            if (bio !== undefined) {
                if (bio.length < 50 || bio.length > 500) {
                    return res.status(400).json({
                        success: false,
                        error: 'Bio must be between 50 and 500 characters'
                    });
                }
                updates.bio = bio;
            }

            if (expertise !== undefined) {
                const validExpertise = ['UI/UX Design', 'Web Development', 'Mobile Development', 
                    'Graphic Design', 'Product Management', 'Marketing', 'Copywriting', 
                    'Business Strategy', 'Data Analysis', 'Other'];
                if (!validExpertise.includes(expertise)) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid expertise'
                    });
                }
                updates.expertise = expertise;
            }

            if (experience !== undefined) {
                const validExperience = ['0-1', '1-3', '3-5', '5-10', '10+'];
                if (!validExperience.includes(experience)) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid experience level'
                    });
                }
                updates.experience = experience;
            }

            if (portfolio !== undefined) {
                updates.portfolio = portfolio.trim();
            }

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No valid fields to update'
                });
            }

            // Update reviewer document
            const reviewer = await Reviewer.findOneAndUpdate(
                { userId },
                { $set: updates },
                { new: true, runValidators: true }
            );

            if (!reviewer) {
                return res.status(404).json({
                    success: false,
                    error: 'Reviewer profile not found'
                });
            }

            // Update UserProfile name if username changed
            if (updates.username) {
                await UserProfile.findOneAndUpdate(
                    { userId },
                    { $set: { name: updates.username } }
                );
            }

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: reviewer
            });

        } else if (userProfile.role === 'owner') {
            // Update owner profile (limited fields)
            const { name } = req.body;
            
            if (!name || name.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    error: 'Name must be at least 2 characters'
                });
            }

            // Update UserProfile
            const updated = await UserProfile.findOneAndUpdate(
                { userId },
                { $set: { name: name.trim() } },
                { new: true }
            );

            // Update all projects with new owner name
            await Project.updateMany(
                { ownerId: userId },
                { $set: { ownerName: name.trim() } }
            );

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: updated
            });
        }

    } catch (error) {
        console.error('Update profile error:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Username already taken'
            });
        }

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
export default router;