import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'HelpMarq <onboarding@resend.dev>';

const emailTemplates = {
    welcome: (data, role) => ({
        subject: `Welcome to HelpMarq${role === 'reviewer' ? ' - Start Reviewing' : ''}!`,
        html: `
            <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 32px;">HelpMarq</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Expert insights. Accessible pricing.</p>
                </div>
                <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px;">
                    <h2 style="color: #1F2937; margin: 0 0 16px 0;">Welcome ${data.name}! 👋</h2>
                    <p style="color: #6B7280; line-height: 1.6;">
                        ${role === 'reviewer' 
                            ? 'You\'re now part of our reviewer community. Start applying to projects and earning XP!'
                            : 'Your account is ready. Upload your first project and get expert feedback!'}
                    </p>
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}" style="display: inline-block; background: linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%); color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 24px;">
                        Get Started
                    </a>
                </div>
            </div>
        `
    }),

    projectSubmitted: (project) => ({
        subject: `Project "${project.title}" is live!`,
        html: `
            <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px;">
                <h2 style="color: #1F2937;">✅ Project Submitted</h2>
                <p style="color: #6B7280;">Your project "<strong>${project.title}</strong>" is now live and visible to reviewers.</p>
                <p style="color: #6B7280;">You'll receive notifications when reviewers apply.</p>
            </div>
        `
    }),

    applicationReceived: (application, project, reviewer) => ({
        subject: `New application for "${project.title}"`,
        html: `
            <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px;">
                <h2 style="color: #1F2937;">📋 New Application</h2>
                <p style="color: #6B7280;"><strong>${reviewer.username}</strong> (Level ${reviewer.level}) applied to review your project.</p>
                <div style="background: #F9FAFB; padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <p style="margin: 0 0 8px 0; color: #1F2937;"><strong>Qualifications:</strong></p>
                    <p style="margin: 0; color: #6B7280;">${application.qualifications}</p>
                </div>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}" style="display: inline-block; background: #2563EB; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
                    Review Application
                </a>
            </div>
        `
    }),

    applicationApproved: (reviewer, project) => ({
        subject: `✅ Approved! Review "${project.title}"`,
        html: `
            <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px;">
                <h2 style="color: #10B981;">🎉 Application Approved!</h2>
                <p style="color: #6B7280;">You can now review "<strong>${project.title}</strong>"</p>
                <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 24px; border-radius: 8px; text-align: center; margin: 24px 0;">
                    <p style="margin: 0; opacity: 0.9;">XP Reward</p>
                    <p style="font-size: 36px; font-weight: 700; margin: 8px 0;">+${project.xpReward} XP</p>
                </div>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}" style="display: inline-block; background: #10B981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                    Start Review
                </a>
            </div>
        `
    }),

    reviewComplete: (project, feedback, reviewer) => ({
        subject: `📬 New feedback on "${project.title}"`,
        html: `
            <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px;">
                <h2 style="color: #1F2937;">💬 Feedback Received</h2>
                <p style="color: #6B7280;"><strong>${reviewer.username}</strong> submitted feedback on your project.</p>
                <div style="background: #F9FAFB; padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <p style="color: #6B7280; font-style: italic;">"${feedback.feedbackText.substring(0, 150)}..."</p>
                </div>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}" style="display: inline-block; background: #2563EB; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                    View & Rate Feedback
                </a>
            </div>
        `
    }),

    ratingReceived: (reviewer, feedback, project) => ({
        subject: `⭐ You earned ${feedback.xpAwarded} XP!`,
        html: `
            <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px;">
                <h2 style="color: #10B981;">🎉 Feedback Rated!</h2>
                <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin: 24px 0;">
                    <p style="font-size: 48px; margin: 10px 0;">${'⭐'.repeat(feedback.ownerRating)}</p>
                    <p style="font-size: 36px; font-weight: 700; margin: 10px 0;">+${feedback.xpAwarded} XP</p>
                </div>
                <div style="background: #F9FAFB; padding: 16px; border-radius: 8px;">
                    <p style="margin: 0; color: #6B7280;"><strong>Total XP:</strong> ${reviewer.xp}</p>
                    <p style="margin: 0; color: #6B7280;"><strong>Level:</strong> ${reviewer.level}</p>
                </div>
            </div>
        `
    })
};

async function sendEmail(templateName, to, data) {
    try {
        const template = emailTemplates[templateName](data);
        
        await resend.emails.send({
            from: FROM_EMAIL,
            to: to,
            subject: template.subject,
            html: template.html
        });
        
        console.log(`✅ Email sent: ${templateName} to ${to}`);
        return { success: true };
    } catch (error) {
        console.error(`❌ Email failed: ${templateName}`, error);
        return { success: false, error: error.message };
    }
}

export async function sendWelcomeEmail(user, role) {
    return await sendEmail('welcome', user.email, { name: user.name || user.email }, role);
}

export async function sendProjectSubmittedEmail(project) {
    return await sendEmail('projectSubmitted', project.ownerEmail, project);
}

export async function sendApplicationReceivedEmail(application, project, reviewer) {
    return await sendEmail('applicationReceived', project.ownerEmail, { application, project, reviewer });
}

export async function sendApplicationApprovedEmail(reviewer, project) {
    return await sendEmail('applicationApproved', reviewer.email, { reviewer, project });
}

export async function sendReviewCompleteEmail(project, feedback, reviewer) {
    return await sendEmail('reviewComplete', project.ownerEmail, { project, feedback, reviewer });
}

export async function sendRatingReceivedEmail(reviewer, feedback, project) {
    return await sendEmail('ratingReceived', reviewer.email, { reviewer, feedback, project });
}