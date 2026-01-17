const cron = require('node-cron');
const Project = require('../models/Project');
const Application = require('../models/Application');
const Feedback = require('../models/Feedback');
const Reviewer = require('../models/Reviewer');
const { sendEmail } = require('./emailService');

// Run every hour
const deadlineReminderJob = cron.schedule('0 * * * *', async () => {
    console.log('🔔 Running deadline reminder check...');
    
    try {
        const now = new Date();
        const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        
        // Find projects with deadline in next 24 hours
        const projects = await Project.find({
            deadline: {
                $gte: now,
                $lte: in24Hours
            },
            status: { $ne: 'completed' }
        });
        
        console.log(`Found ${projects.length} projects with deadlines in next 24 hours`);
        
        for (const project of projects) {
            // Find approved reviewers who haven't submitted feedback
            const approvedApps = await Application.find({
                projectId: project._id,
                status: 'approved'
            });
            
            for (const app of approvedApps) {
                // Check if feedback already submitted
                const feedbackExists = await Feedback.findOne({
                    projectId: project._id,
                    reviewerId: app.reviewerId
                });
                
                if (!feedbackExists) {
                    // Send reminder
                    const reviewer = await Reviewer.findById(app.reviewerId);
                    
                    if (reviewer) {
                        const hoursLeft = Math.floor((project.deadline - now) / (1000 * 60 * 60));
                        
                        await sendEmail('deadlineReminder', reviewer.email, {
                            projectTitle: project.title,
                            hoursLeft: hoursLeft,
                            projectLink: project.link
                        });
                        
                        console.log(`✓ Sent reminder to ${reviewer.email} for "${project.title}"`);
                    }
                }
            }
        }
        
        console.log('✓ Deadline reminder check complete');
        
    } catch (error) {
        console.error('❌ Deadline reminder error:', error);
    }
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

module.exports = { startCronJobs, stopCronJobs };