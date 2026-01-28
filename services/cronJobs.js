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

export { startCronJobs, stopCronJobs };