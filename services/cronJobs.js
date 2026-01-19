import cron from 'node-cron';
import Project from '../models/Project.js';
import Application from '../models/Application.js';
import Feedback from '../models/Feedback.js';
import Reviewer from '../models/Reviewer.js';
import { sendEmail } from './emailService.js';

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
                        console.log(`✓ Sent reminder to ${reviewer.email} for "${project.title}"`);
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
    console.log('✓ Deadline reminder job started (runs every hour)');
}

function stopCronJobs() {
    deadlineReminderJob.stop();
    console.log('Cron jobs stopped');
}

export { startCronJobs, stopCronJobs };