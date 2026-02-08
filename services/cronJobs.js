import cron from 'node-cron';
import Project from '../models/Project.js';
import Application from '../models/Application.js';
import Feedback from '../models/Feedback.js';
import Reviewer from '../models/Reviewer.js';
import mongoose from 'mongoose';

// ✅ VERIFIED SCHEMA: collection = "user", fields = emailVerified, createdAt

const unverifiedUserReminderJob = cron.schedule('0 */6 * * *', async () => {
    console.log('🔔 Checking for unverified users...');
    
    try {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const twentyThreeHoursAgo = new Date(now.getTime() - 23 * 60 * 60 * 1000);
        
        const UserCollection = mongoose.connection.db.collection('user');
        
        const unverifiedUsers = await UserCollection.find({
            emailVerified: false,
            createdAt: {
                $gte: twentyFourHoursAgo,
                $lte: twentyThreeHoursAgo
            }
        }).toArray();
        
        console.log(`Found ${unverifiedUsers.length} unverified users needing reminders`);
        
        for (const user of unverifiedUsers) {
            if (user.reminderEmailSent === true) continue;
            
            try {
                const { sendVerificationReminderEmail } = await import('./emailService.js');
                await sendVerificationReminderEmail(user.email, user.name || user.email);
                
                await UserCollection.updateOne(
                    { _id: user._id },
                    { $set: { reminderEmailSent: true } }
                );
                
                console.log(`✓ Sent reminder to ${user.email}`);
            } catch (emailError) {
                console.error(`❌ Failed to send reminder to ${user.email}:`, emailError);
            }
        }
        
        console.log('✓ Reminder check complete');
        
    } catch (error) {
        console.error('❌ Reminder job error:', error);
    }
}, {
    scheduled: false
});

const deleteUnverifiedUsersJob = cron.schedule('0 0 * * *', async () => {
    console.log('🗑️  Checking for expired unverified users...');
    
    try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        
        const UserCollection = mongoose.connection.db.collection('user');
        
        const result = await UserCollection.deleteMany({
            emailVerified: false,
            createdAt: { $lte: sevenDaysAgo }
        });
        
        console.log(`✓ Deleted ${result.deletedCount} unverified users older than 7 days`);
        
    } catch (error) {
        console.error('❌ Delete unverified users error:', error);
    }
}, {
    scheduled: false
});

const deadlineReminderJob = cron.schedule('0 * * * *', async () => {
    console.log('🔔 Running deadline reminder check...');
    
    try {
        const now = new Date();
        const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        
        const projects = await Project.find({
            deadline: {
                $gte: now,
                $lte: in24Hours
            },
            status: { $ne: 'completed' }
        });
        
        console.log(`Found ${projects.length} projects with deadlines in next 24 hours`);
        
        for (const project of projects) {
            const approvedApps = await Application.find({
                projectId: project._id,
                status: 'approved'
            });
            
            for (const app of approvedApps) {
                const feedbackExists = await Feedback.findOne({
                    projectId: project._id,
                    reviewerId: app.reviewerId
                });
                
                if (!feedbackExists) {
                    const reviewer = await Reviewer.findById(app.reviewerId);
                    
                    if (reviewer) {
                        const hoursLeft = Math.floor((project.deadline - now) / (1000 * 60 * 60));
                        console.log(`✓ Would send reminder to ${reviewer.email} for "${project.title}"`);
                    }
                }
            }
        }
        
        console.log('✓ Deadline reminder check complete');
        
    } catch (error) {
        console.error('❌ Deadline reminder error:', error);
    }
}, {
    scheduled: false
});

function startCronJobs() {
    console.log('🕐 Starting cron jobs...');
    deadlineReminderJob.start();
    unverifiedUserReminderJob.start();
    deleteUnverifiedUsersJob.start();
    console.log('✓ Deadline reminder job started (runs every hour)');
    console.log('✓ Unverified user reminder job started (runs every 6 hours)');
    console.log('✓ Delete unverified users job started (runs daily at midnight)');
}

function stopCronJobs() {
    deadlineReminderJob.stop();
    unverifiedUserReminderJob.stop();
    deleteUnverifiedUsersJob.stop();
    console.log('Cron jobs stopped');
}

// Add to existing cronJobs.js

import Message from '../models/Message.js';
import { sendEmail } from './emailService.js';

// Check for unread messages older than 30 minutes
export const checkUnreadMessages = async () => {
    try {
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        
        // Find unread messages older than 30 min, email not sent
        const unreadMessages = await Message.find({
            read: false,
            emailSent: false,
            createdAt: { $lt: thirtyMinutesAgo }
        }).populate('applicationId');
        
        for (const message of unreadMessages) {
            if (!message.applicationId) continue;
            
            const application = await Application.findById(message.applicationId)
                .populate('projectId', 'ownerId ownerName title')
                .populate('reviewerId', 'userId username email');
            
            if (!application) continue;
            
            // Determine recipient
            let recipientEmail, recipientName;
            
            if (message.senderRole === 'owner') {
                // Message from owner → notify reviewer
                recipientEmail = application.reviewerId?.email;
                recipientName = application.reviewerId?.username;
            } else {
                // Message from reviewer → notify owner
                // Need to get owner email from Better Auth user
                // For now, skip (owner email not in your schema)
                // You'll need to fetch from Better Auth or add to project schema
                continue;
            }
            
            if (!recipientEmail) continue;
            
            // Send email
            await sendEmail({
                to: recipientEmail,
                subject: `New message about "${application.projectId.title}"`,
                html: `
                    <h2>You have an unread message</h2>
                    <p>Hi ${recipientName},</p>
                    <p><strong>${message.senderName}</strong> sent you a message about the project "${application.projectId.title}":</p>
                    <blockquote style="background: #f5f5f5; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
                        ${message.text}
                    </blockquote>
                    <p><a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reply Now</a></p>
                `
            });
            
            // Mark email as sent
            message.emailSent = true;
            await message.save();
            
            console.log(`✅ Unread message email sent to ${recipientEmail}`);
        }
        
    } catch (error) {
        console.error('❌ Check unread messages error:', error);
    }
};

// Run every 5 minutes
cron.schedule('*/5 * * * *', checkUnreadMessages);

export { startCronJobs, stopCronJobs };