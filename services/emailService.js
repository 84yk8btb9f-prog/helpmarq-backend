import { Resend } from 'resend';

const FROM_EMAIL = 'no-reply@sapavault.com';
const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================
// EMAIL TEMPLATES
// ============================================


const emailTemplates = {
    
    otp: (data) => ({
        subject: "Your HelpMarq verification code",
        html: `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background: #F9FAFB;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: #F9FAFB; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 12px; overflow: hidden;">
                    <tr>
                        <td style="background: linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%); padding: 32px; text-align: center;">
                            <h1 style="margin: 0; font-size: 32px; color: white;">helpmarq</h1>
                            <p style="margin: 8px 0 0 0; font-size: 14px; color: white; opacity: 0.9;">Expert insights. Accessible pricing.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #1F2937;">Your verification code</h2>
                            <p style="margin: 0 0 24px 0; font-size: 16px; color: #4B5563;">Enter this code to verify your email:</p>
                            <div style="background: #1F2937; padding: 24px; border-radius: 12px; text-align: center; margin: 24px 0;">
                                <div style="font-size: 48px; font-weight: 700; color: #10B981; letter-spacing: 8px; font-family: monospace;">
                                    ${data.code}
                                </div>
                            </div>
                            <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; border-radius: 8px; margin: 24px 0;">
                                <p style="margin: 0; color: #92400E; font-size: 14px;">⏰ This code expires in 10 minutes</p>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="background: #F9FAFB; padding: 24px; text-align: center; border-top: 1px solid #E5E7EB;">
                            <p style="margin: 0; font-size: 13px; color: #6B7280;">
                                <strong>helpmarq</strong> • Expert insights. Accessible pricing.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `
    }),
    
    welcomeOwner: (data) => ({
        subject: "Welcome to helpmarq",
        html: `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background: #F9FAFB;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: #F9FAFB; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 12px; overflow: hidden;">
                    <tr>
                        <td style="background: linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%); padding: 32px 40px; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; color: white; margin-bottom: 8px;">helpmarq</div>
                            <div style="font-size: 14px; color: white; opacity: 0.9;">Expert insights. Accessible pricing.</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <h1 style="font-size: 24px; font-weight: 700; color: #1F2937; margin: 0 0 16px 0;">Welcome to helpmarq 👋</h1>
                            <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;">Hi ${data.name},</p>
                            <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;">Thanks for joining helpmarq. You're now part of a platform that turns uncertainty into confident action through verified, multi-perspective feedback.</p>
                            <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0;">— The helpmarq team</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background: #F9FAFB; border-top: 1px solid #E5E7EB; padding: 32px 40px; text-align: center;">
                            <p style="margin: 0; font-size: 13px; color: #6B7280;"><strong>helpmarq</strong> • Expert insights. Accessible pricing.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `
    }),
    
    welcomeReviewer: (data) => ({
        subject: "You're approved — Start reviewing",
        html: `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background: #F9FAFB;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: #F9FAFB; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 12px; overflow: hidden;">
                    <tr>
                        <td style="background: linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%); padding: 32px 40px; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; color: white; margin-bottom: 8px;">helpmarq</div>
                            <div style="font-size: 14px; color: white; opacity: 0.9;">Expert insights. Accessible pricing.</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <h1 style="font-size: 24px; font-weight: 700; color: #1F2937; margin: 0 0 16px 0;">You're approved! ✅</h1>
                            <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;">Hi ${data.name},</p>
                            <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;">Congratulations! Your reviewer profile has been approved. You can now start monetizing your expertise on helpmarq.</p>
                            <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0;">— The helpmarq team</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background: #F9FAFB; border-top: 1px solid #E5E7EB; padding: 32px 40px; text-align: center;">
                            <p style="margin: 0; font-size: 13px; color: #6B7280;"><strong>helpmarq</strong> • Expert insights. Accessible pricing.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `
    }),
    
    applicationReceived: (data) => ({
        subject: `New application for "${data.projectTitle}"`,
        html: `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background: #F9FAFB;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: #F9FAFB; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 12px; overflow: hidden;">
                    <tr>
                        <td style="background: linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%); padding: 32px 40px; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; color: white; margin-bottom: 8px;">helpmarq</div>
                            <div style="font-size: 14px; color: white; opacity: 0.9;">Expert insights. Accessible pricing.</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <h1 style="font-size: 24px; font-weight: 700; color: #1F2937; margin: 0 0 16px 0;">New Applicant! 📋</h1>
                            <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;">Hi ${data.ownerName},</p>
                            <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;"><strong>${data.reviewerName}</strong> applied to review your project <strong>"${data.projectTitle}"</strong>.</p>
                            <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0;">Login to review their application!</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background: #F9FAFB; border-top: 1px solid #E5E7EB; padding: 32px 40px; text-align: center;">
                            <p style="margin: 0; font-size: 13px; color: #6B7280;"><strong>helpmarq</strong> • Expert insights. Accessible pricing.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `
    }),
    
    applicationApproved: (data) => ({
        subject: `Application approved for "${data.projectTitle}"`,
        html: `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background: #F9FAFB;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: #F9FAFB; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 12px; overflow: hidden;">
                    <tr>
                        <td style="background: linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%); padding: 32px 40px; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; color: white; margin-bottom: 8px;">helpmarq</div>
                            <div style="font-size: 14px; color: white; opacity: 0.9;">Expert insights. Accessible pricing.</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <h1 style="font-size: 24px; font-weight: 700; color: #1F2937; margin: 0 0 16px 0;">Application Approved! ✅</h1>
                            <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;">Hi ${data.reviewerName},</p>
                            <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;">Great news! Your application has been approved for <strong>"${data.projectTitle}"</strong>.</p>
                            <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0;">Login to start your review and earn XP!</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background: #F9FAFB; border-top: 1px solid #E5E7EB; padding: 32px 40px; text-align: center;">
                            <p style="margin: 0; font-size: 13px; color: #6B7280;"><strong>helpmarq</strong> • Expert insights. Accessible pricing.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `
    }),
    
    applicationRejected: (data) => ({
        subject: "Application update",
        html: `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background: #F9FAFB;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: #F9FAFB; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 12px; overflow: hidden;">
                    <tr>
                        <td style="background: linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%); padding: 32px 40px; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; color: white; margin-bottom: 8px;">helpmarq</div>
                            <div style="font-size: 14px; color: white; opacity: 0.9;">Expert insights. Accessible pricing.</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <h1 style="font-size: 24px; font-weight: 700; color: #1F2937; margin: 0 0 16px 0;">Application Update</h1>
                            <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;">Hi ${data.reviewerName},</p>
                            <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;">Thank you for your interest in reviewing <strong>"${data.projectTitle}"</strong>.</p>
                            <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0;">The project owner has decided to move forward with other reviewers for this project. Keep applying!</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background: #F9FAFB; border-top: 1px solid #E5E7EB; padding: 32px 40px; text-align: center;">
                            <p style="margin: 0; font-size: 13px; color: #6B7280;"><strong>helpmarq</strong> • Expert insights. Accessible pricing.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `
    }),
    
    projectSubmitted: (data) => ({
        subject: "Project uploaded successfully",
        html: `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background: #F9FAFB;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: #F9FAFB; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 12px; overflow: hidden;">
                    <tr>
                        <td style="background: linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%); padding: 32px 40px; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; color: white; margin-bottom: 8px;">helpmarq</div>
                            <div style="font-size: 14px; color: white; opacity: 0.9;">Expert insights. Accessible pricing.</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <h1 style="font-size: 24px; font-weight: 700; color: #1F2937; margin: 0 0 16px 0;">Project Uploaded! 🎉</h1>
                            <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;">Hi ${data.ownerName},</p>
                            <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;">Your project <strong>"${data.projectTitle}"</strong> is now live and reviewers can apply!</p>
                            <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0;">— The helpmarq team</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background: #F9FAFB; border-top: 1px solid #E5E7EB; padding: 32px 40px; text-align: center;">
                            <p style="margin: 0; font-size: 13px; color: #6B7280;"><strong>helpmarq</strong> • Expert insights. Accessible pricing.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `
    }),
    
    reviewComplete: (data) => ({
        subject: `New feedback for "${data.projectTitle}"`,
        html: `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background: #F9FAFB;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: #F9FAFB; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 12px; overflow: hidden;">
                    <tr>
                        <td style="background: linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%); padding: 32px 40px; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; color: white; margin-bottom: 8px;">helpmarq</div>
                            <div style="font-size: 14px; color: white; opacity: 0.9;">Expert insights. Accessible pricing.</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <h1 style="font-size: 24px; font-weight: 700; color: #1F2937; margin: 0 0 16px 0;">New Feedback! 💬</h1>
                            <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;">Hi ${data.ownerName},</p>
                            <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;"><strong>${data.reviewerName}</strong> submitted feedback for <strong>"${data.projectTitle}"</strong>.</p>
                            <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0;">Login to review and rate their feedback!</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background: #F9FAFB; border-top: 1px solid #E5E7EB; padding: 32px 40px; text-align: center;">
                            <p style="margin: 0; font-size: 13px; color: #6B7280;"><strong>helpmarq</strong> • Expert insights. Accessible pricing.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `
    }),
    
    ratingReceived: (data) => ({
        subject: "You earned XP!",
        html: `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background: #F9FAFB;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: #F9FAFB; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 12px; overflow: hidden;">
                    <tr>
                        <td style="background: linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%); padding: 32px 40px; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; color: white; margin-bottom: 8px;">helpmarq</div>
                            <div style="font-size: 14px; color: white; opacity: 0.9;">Expert insights. Accessible pricing.</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <h1 style="font-size: 24px; font-weight: 700; color: #1F2937; margin: 0 0 16px 0;">You Earned XP! ⭐</h1>
                            <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;">Hi ${data.reviewerName},</p>
                            <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;">Your feedback for <strong>"${data.projectTitle}"</strong> was rated <strong>${data.rating} stars</strong>!</p>
                            <p style="font-size: 32px; color: #10B981; font-weight: 700; margin: 16px 0; text-align: center;">+${data.xpAwarded} XP</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background: #F9FAFB; border-top: 1px solid #E5E7EB; padding: 32px 40px; text-align: center;">
                            <p style="margin: 0; font-size: 13px; color: #6B7280;"><strong>helpmarq</strong> • Expert insights. Accessible pricing.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `
    })
};

// ============================================
// SEND EMAIL FUNCTION
// ============================================

async function sendEmail(templateName, to, data) {
    try {
        console.log(`📧 Preparing email: ${templateName} to ${to}`);
        
        if (!emailTemplates[templateName]) {
            throw new Error(`Email template "${templateName}" not found`);
        }
        
        const template = emailTemplates[templateName](data);

        console.log(`📨 Subject: ${template.subject}`);
        console.log(`📤 Sending via Resend...`);

        const result = await resend.emails.send({
            from: FROM_EMAIL,
            to: to,
            subject: template.subject,
            html: template.html
        });

        console.log(`✅ Email sent successfully: ${templateName} to ${to}`);
        console.log(`📬 Resend ID:`, result.id);
        
        return { success: true, id: result.id };
    } catch (error) {
        console.error(`❌ Email failed: ${templateName} to ${to}`);
        console.error(`Error message: ${error.message}`);
        
        return { success: false, error: error.message };
    }
}

// ============================================
// EXPORT FUNCTIONS (ONLY ONCE!)
// ============================================

export async function sendOTPEmail(email, code) {
    return sendEmail('otp', email, { code });
}

export async function sendWelcomeEmail(user, role) {
    const templateName = role === 'reviewer' ? 'welcomeReviewer' : 'welcomeOwner';
    return sendEmail(templateName, user.email, { name: user.name });
}

export async function sendApplicationReceivedEmail(ownerEmail, data) {
    return sendEmail('applicationReceived', ownerEmail, data);
}

export async function sendApplicationApprovedEmail(reviewerEmail, data) {
    return sendEmail('applicationApproved', reviewerEmail, data);
}

export async function sendApplicationRejectedEmail(reviewerEmail, data) {
    return sendEmail('applicationRejected', reviewerEmail, data);
}

export async function sendProjectSubmittedEmail(project) {
    return sendEmail('projectSubmitted', project.ownerEmail, {
        ownerName: project.ownerName,
        projectTitle: project.title
    });
}

export async function sendReviewCompleteEmail(project, feedback, reviewer) {
    return sendEmail('reviewComplete', project.ownerEmail, {
        ownerName: project.ownerName,
        reviewerName: reviewer.username,
        projectTitle: project.title
    });
}

export async function sendRatingReceivedEmail(reviewer, feedback, project) {
    return sendEmail('ratingReceived', reviewer.email, {
        reviewerName: reviewer.username,
        projectTitle: project.title,
        rating: feedback.ownerRating,
        xpAwarded: feedback.xpAwarded
    });
}

// Placeholder - not used
export async function sendReviewAssignedEmail() {
    console.log('📧 sendReviewAssignedEmail called (placeholder)');
    return { success: true };
}

export async function sendFeedbackSubmittedEmail() {
    console.log('📧 sendFeedbackSubmittedEmail called (placeholder)');
    return { success: true };
}