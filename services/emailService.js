import { Resend } from 'resend';

const FROM_EMAIL = 'no-reply@sapavault.com';
const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================
// EMAIL TEMPLATES - UPDATED STRUCTURE
// ============================================

const emailTemplates = {
    // 1. OTP VERIFICATION EMAIL
    otpVerification: (data) => ({
        subject: 'Verify Your Email - HelpMarq',
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - HelpMarq</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F9FAFB;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 32px 40px; background: linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%); border-radius: 16px 16px 0 0; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; color: white; margin-bottom: 8px;">HelpMarq</div>
                            <div style="font-size: 14px; color: white; opacity: 0.9;">Expert insights. Accessible pricing.</div>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #1F2937;">Verify your email address</h1>
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #4B5563;">Thanks for signing up for HelpMarq. To complete your registration, please enter this verification code:</p>
                            
                            <!-- OTP Code -->
                            <div style="background: #1F2937; color: #10B981; padding: 16px 20px; border-radius: 8px; font-family: 'Monaco', monospace; font-size: 24px; text-align: center; letter-spacing: 4px; margin: 24px 0;">
                                ${data.code}
                            </div>
                            
                            <p style="margin: 0 0 8px; font-size: 14px; line-height: 1.6; color: #6B7280;">This code expires in <strong style="color: #1F2937;">24 hours</strong>.</p>
                            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #6B7280;">If you didn't create an account on HelpMarq, you can safely ignore this email.</p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px 40px; background-color: #F9FAFB; border-radius: 0 0 16px 16px; text-align: center;">
                            <p style="margin: 0 0 8px 0; font-size: 13px; color: #6B7280;"><strong>HelpMarq</strong> • Expert insights. Accessible pricing.</p>
                            <p style="margin: 0; font-size: 13px; color: #6B7280;"><a href="https://helpmarq-frontend.vercel.app" style="color: #2563EB; text-decoration: none;">Website</a> • <a href="mailto:support@helpmarq.com" style="color: #2563EB; text-decoration: none;">Support</a></p>
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

    // 2. WELCOME PROJECT OWNER EMAIL
    welcomeOwner: (data) => ({
        subject: 'Welcome to HelpMarq — Here's how to get started',
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F9FAFB;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                    <tr>
                        <td style="padding: 32px 40px; background: linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%); border-radius: 16px 16px 0 0; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; color: white; margin-bottom: 8px;">HelpMarq</div>
                            <div style="font-size: 14px; color: white; opacity: 0.9;">Expert insights. Accessible pricing.</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #1F2937;">Welcome to HelpMarq 👋</h1>
                            <p style="margin: 0 0 8px; font-size: 16px; line-height: 1.6; color: #4B5563;">Hi ${data.name},</p>
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #4B5563;">Thanks for joining HelpMarq. You're now part of a platform that turns uncertainty into confident action through verified, multi-perspective feedback.</p>
                            
                            <div style="background-color: #EFF6FF; border: 2px solid #DBEAFE; border-radius: 8px; padding: 20px; margin: 24px 0;">
                                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1E40AF;">What makes HelpMarq different:</h3>
                                <ul style="margin: 0; padding-left: 20px; color: #1F2937; line-height: 1.8;">
                                    <li><strong>Multi-perspective reviews</strong> — Expert + practitioner + user feedback, not single opinions</li>
                                    <li><strong>Structured insights</strong> — Organized, actionable feedback you can implement immediately</li>
                                    <li><strong>48-hour delivery</strong> — Fast turnaround without sacrificing quality</li>
                                    <li><strong>Quality guarantee</strong> — If feedback doesn't meet standards, get your money back</li>
                                </ul>
                            </div>
                            
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #4B5563;"><strong>Ready to get started?</strong> Submit your first project and choose your reviewer tier. You'll receive structured feedback within 48 hours.</p>
                            
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="https://helpmarq-frontend.vercel.app" style="display: inline-block; padding: 14px 32px; background-color: #2563EB; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Submit Your First Project</a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 24px 0 8px; font-size: 16px; line-height: 1.6; color: #4B5563;">Have questions? Reply to this email or check out our <a href="https://helpmarq-frontend.vercel.app/faq" style="color: #2563EB; text-decoration: none;">FAQ page</a>.</p>
                            <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #4B5563;">— The HelpMarq team</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 32px 40px; background-color: #F9FAFB; border-radius: 0 0 16px 16px; text-align: center;">
                            <p style="margin: 0 0 8px 0; font-size: 13px; color: #6B7280;"><strong>HelpMarq</strong> • Expert insights. Accessible pricing.</p>
                            <p style="margin: 0; font-size: 13px; color: #6B7280;"><a href="https://helpmarq-frontend.vercel.app" style="color: #2563EB; text-decoration: none;">Website</a> • <a href="mailto:support@helpmarq.com" style="color: #2563EB; text-decoration: none;">Support</a></p>
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

    // 3. WELCOME REVIEWER EMAIL
    welcomeReviewer: (data) => ({
        subject: 'You're approved — Start reviewing on HelpMarq',
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F9FAFB;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                    <tr>
                        <td style="padding: 32px 40px; background: linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%); border-radius: 16px 16px 0 0; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; color: white; margin-bottom: 8px;">HelpMarq</div>
                            <div style="font-size: 14px; color: white; opacity: 0.9;">Expert insights. Accessible pricing.</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #1F2937;">You're approved! ✅</h1>
                            <p style="margin: 0 0 8px; font-size: 16px; line-height: 1.6; color: #4B5563;">Hi ${data.name},</p>
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #4B5563;">Congratulations! Your reviewer profile has been approved. You can now start monetizing your expertise on HelpMarq.</p>
                            
                            <div style="background-color: #EFF6FF; border: 2px solid #DBEAFE; border-radius: 8px; padding: 20px; margin: 24px 0;">
                                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1E40AF;">How HelpMarq works for reviewers:</h3>
                                <ul style="margin: 0; padding-left: 20px; color: #1F2937; line-height: 1.8;">
                                    <li><strong>Browse projects</strong> — Choose projects that match your expertise and schedule</li>
                                    <li><strong>Complete structured reviews</strong> — Use our templates for clear, organized feedback</li>
                                    <li><strong>Get paid fast</strong> — Payment within 48 hours of review completion</li>
                                    <li><strong>Build your reputation</strong> — Ratings and testimonials showcase your expertise</li>
                                </ul>
                            </div>
                            
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #4B5563;">Ready to earn? Browse available projects and claim your first review.</p>
                            
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="https://helpmarq-frontend.vercel.app" style="display: inline-block; padding: 14px 32px; background-color: #2563EB; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Browse Available Projects</a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 24px 0 8px; font-size: 16px; line-height: 1.6; color: #4B5563;"><strong>Important:</strong> Complete reviews within the agreed timeline and maintain quality standards to keep your reviewer status active.</p>
                            <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #4B5563;">— The HelpMarq team</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 32px 40px; background-color: #F9FAFB; border-radius: 0 0 16px 16px; text-align: center;">
                            <p style="margin: 0 0 8px 0; font-size: 13px; color: #6B7280;"><strong>HelpMarq</strong> • Expert insights. Accessible pricing.</p>
                            <p style="margin: 0; font-size: 13px; color: #6B7280;"><a href="https://helpmarq-frontend.vercel.app" style="color: #2563EB; text-decoration: none;">Website</a> • <a href="mailto:support@helpmarq.com" style="color: #2563EB; text-decoration: none;">Support</a></p>
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

    // 4. APPLICATION RECEIVED (Owner notification)
    applicationReceived: (data) => ({
        subject: `New Application: ${data.reviewerName} wants to review "${data.projectTitle}"`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F9FAFB;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                    <tr>
                        <td style="padding: 32px 40px; background: linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%); border-radius: 16px 16px 0 0; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; color: white; margin-bottom: 8px;">HelpMarq</div>
                            <div style="font-size: 14px; color: white; opacity: 0.9;">Expert insights. Accessible pricing.</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #1F2937;">New Application Received 📬</h1>
                            <p style="margin: 0 0 8px; font-size: 16px; line-height: 1.6; color: #4B5563;">Hi ${data.ownerName},</p>
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #4B5563;">A reviewer has applied to review your project.</p>
                            
                            <div style="background-color: #F9FAFB; border-radius: 8px; padding: 24px; margin: 24px 0;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Project:</td>
                                        <td style="padding: 8px 0; color: #1F2937; font-weight: 600; text-align: right;">${data.projectTitle}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Reviewer:</td>
                                        <td style="padding: 8px 0; color: #1F2937; font-weight: 600; text-align: right;">${data.reviewerName}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #6B7280;">Review their profile and decide whether to approve or reject their application.</p>
                            
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="https://helpmarq-frontend.vercel.app" style="display: inline-block; padding: 14px 32px; background-color: #2563EB; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View Application</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 32px 40px; background-color: #F9FAFB; border-radius: 0 0 16px 16px; text-align: center;">
                            <p style="margin: 0 0 8px 0; font-size: 13px; color: #6B7280;"><strong>HelpMarq</strong> • Expert insights. Accessible pricing.</p>
                            <p style="margin: 0; font-size: 13px; color: #6B7280;"><a href="https://helpmarq-frontend.vercel.app" style="color: #2563EB; text-decoration: none;">Website</a> • <a href="mailto:support@helpmarq.com" style="color: #2563EB; text-decoration: none;">Support</a></p>
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

    // 5. APPLICATION APPROVED (Reviewer notification)
    applicationApproved: (data) => ({
        subject: `Approved! You can now review "${data.projectTitle}"`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F9FAFB;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                    <tr>
                        <td style="padding: 32px 40px; background: linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%); border-radius: 16px 16px 0 0; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; color: white; margin-bottom: 8px;">HelpMarq</div>
                            <div style="font-size: 14px; color: white; opacity: 0.9;">Expert insights. Accessible pricing.</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #10B981;">Congratulations! Application Approved ✅</h1>
                            <p style="margin: 0 0 8px; font-size: 16px; line-height: 1.6; color: #4B5563;">Hi ${data.reviewerName},</p>
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #4B5563;">Your application has been approved.</p>
                            
                            <div style="background-color: #F9FAFB; border-radius: 8px; padding: 24px; margin: 24px 0;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Project:</td>
                                        <td style="padding: 8px 0; color: #1F2937; font-weight: 600; text-align: right;">${data.projectTitle}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #6B7280;">You can now access the full project details and submit your feedback.</p>
                            
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="https://helpmarq-frontend.vercel.app" style="display: inline-block; padding: 14px 32px; background-color: #10B981; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View Project</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 32px 40px; background-color: #F9FAFB; border-radius: 0 0 16px 16px; text-align: center;">
                            <p style="margin: 0 0 8px 0; font-size: 13px; color: #6B7280;"><strong>HelpMarq</strong> • Expert insights. Accessible pricing.</p>
                            <p style="margin: 0; font-size: 13px; color: #6B7280;"><a href="https://helpmarq-frontend.vercel.app" style="color: #2563EB; text-decoration: none;">Website</a> • <a href="mailto:support@helpmarq.com" style="color: #2563EB; text-decoration: none;">Support</a></p>
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

    // 6. APPLICATION REJECTED (Reviewer notification)
    applicationRejected: (data) => ({
        subject: `Application Update: "${data.projectTitle}"`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F9FAFB;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                    <tr>
                        <td style="padding: 32px 40px; background: linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%); border-radius: 16px 16px 0 0; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; color: white; margin-bottom: 8px;">HelpMarq</div>
                            <div style="font-size: 14px; color: white; opacity: 0.9;">Expert insights. Accessible pricing.</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #1F2937;">Application Not Selected</h1>
                            <p style="margin: 0 0 8px; font-size: 16px; line-height: 1.6; color: #4B5563;">Hi ${data.reviewerName},</p>
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #4B5563;">Thank you for your interest in reviewing this project.</p>
                            
                            <div style="background-color: #F9FAFB; border-radius: 8px; padding: 24px; margin: 24px 0;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Project:</td>
                                        <td style="padding: 8px 0; color: #1F2937; font-weight: 600; text-align: right;">${data.projectTitle}</td>
                                    </tr>
                                    ${data.reason ? `
                                    <tr>
                                        <td colspan="2" style="padding: 16px 0 0; color: #6B7280; font-size: 14px; border-top: 1px solid #E5E5EA;">
                                            <strong style="display: block; color: #1F2937; margin-bottom: 8px;">Feedback from Owner:</strong>
                                            ${data.reason}
                                        </td>
                                    </tr>
                                    ` : ''}
                                </table>
                            </div>
                            
                            <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #6B7280;">Don't be discouraged! Keep building your profile and applying to projects that match your expertise.</p>
                            
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="https://helpmarq-frontend.vercel.app" style="display: inline-block; padding: 14px 32px; background-color: #2563EB; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Browse More Projects</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 32px 40px; background-color: #F9FAFB; border-radius: 0 0 16px 16px; text-align: center;">
                            <p style="margin: 0 0 8px 0; font-size: 13px; color: #6B7280;"><strong>HelpMarq</strong> • Expert insights. Accessible pricing.</p>
                            <p style="margin: 0; font-size: 13px; color: #6B7280;"><a href="https://helpmarq-frontend.vercel.app" style="color: #2563EB; text-decoration: none;">Website</a> • <a href="mailto:support@helpmarq.com" style="color: #2563EB; text-decoration: none;">Support</a></p>
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

    // 7. PROJECT SUBMITTED (Owner confirmation)
    projectSubmitted: (data) => ({
        subject: `Project Submitted: "${data.projectTitle}"`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F9FAFB;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                    <tr>
                        <td style="padding: 32px 40px; background: linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%); border-radius: 16px 16px 0 0; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; color: white; margin-bottom: 8px;">HelpMarq</div>
                            <div style="font-size: 14px; color: white; opacity: 0.9;">Expert insights. Accessible pricing.</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #10B981;">Project Submitted Successfully! 🎉</h1>
                            <p style="margin: 0 0 8px; font-size: 16px; line-height: 1.6; color: #4B5563;">Hi ${data.ownerName},</p>
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #4B5563;">Your project has been submitted and is now live on HelpMarq.</p>
                            
                            <div style="background-color: #F9FAFB; border-radius: 8px; padding: 24px; margin: 24px 0;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Project:</td>
                                        <td style="padding: 8px 0; color: #1F2937; font-weight: 600; text-align: right;">${data.projectTitle}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #6B7280;">Reviewers can now discover and apply to review your project. You'll receive notifications when applications come in.</p>
                            
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="https://helpmarq-frontend.vercel.app" style="display: inline-block; padding: 14px 32px; background-color: #2563EB; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View Applications</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 32px 40px; background-color: #F9FAFB; border-radius: 0 0 16px 16px; text-align: center;">
                            <p style="margin: 0 0 8px 0; font-size: 13px; color: #6B7280;"><strong>HelpMarq</strong> • Expert insights. Accessible pricing.</p>
                            <p style="margin: 0; font-size: 13px; color: #6B7280;"><a href="https://helpmarq-frontend.vercel.app" style="color: #2563EB; text-decoration: none;">Website</a> • <a href="mailto:support@helpmarq.com" style="color: #2563EB; text-decoration: none;">Support</a></p>
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

    // 8. REVIEW COMPLETE (Owner notification)
    reviewComplete: (data) => ({
        subject: `New Feedback Received for "${data.projectTitle}"`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F9FAFB;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                    <tr>
                        <td style="padding: 32px 40px; background: linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%); border-radius: 16px 16px 0 0; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; color: white; margin-bottom: 8px;">HelpMarq</div>
                            <div style="font-size: 14px; color: white; opacity: 0.9;">Expert insights. Accessible pricing.</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #1F2937;">New Feedback Received! 📝</h1>
                            <p style="margin: 0 0 8px; font-size: 16px; line-height: 1.6; color: #4B5563;">Hi ${data.ownerName},</p>
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #4B5563;">${data.reviewerName} has submitted feedback for your project.</p>
                            
                            <div style="background-color: #F9FAFB; border-radius: 8px; padding: 24px; margin: 24px 0;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Project:</td>
                                        <td style="padding: 8px 0; color: #1F2937; font-weight: 600; text-align: right;">${data.projectTitle}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Reviewer:</td>
                                        <td style="padding: 8px 0; color: #1F2937; font-weight: 600; text-align: right;">${data.reviewerName}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #6B7280;">View the feedback now and rate the reviewer's contribution.</p>
                            
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="https://helpmarq-frontend.vercel.app" style="display: inline-block; padding: 14px 32px; background-color: #2563EB; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View Feedback</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 32px 40px; background-color: #F9FAFB; border-radius: 0 0 16px 16px; text-align: center;">
                            <p style="margin: 0 0 8px 0; font-size: 13px; color: #6B7280;"><strong>HelpMarq</strong> • Expert insights. Accessible pricing.</p>
                            <p style="margin: 0; font-size: 13px; color: #6B7280;"><a href="https://helpmarq-frontend.vercel.app" style="color: #2563EB; text-decoration: none;">Website</a> • <a href="mailto:support@helpmarq.com" style="color: #2563EB; text-decoration: none;">Support</a></p>
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

    // 9. RATING RECEIVED (Reviewer notification)
    ratingReceived: (data) => ({
        subject: `You Earned ${data.xpAwarded} XP for "${data.projectTitle}"!`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F9FAFB;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                    <tr>
                        <td style="padding: 32px 40px; background: linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%); border-radius: 16px 16px 0 0; text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; color: white; margin-bottom: 8px;">HelpMarq</div>
                            <div style="font-size: 14px; color: white; opacity: 0.9;">Expert insights. Accessible pricing.</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #10B981;">You Received a Rating! ⭐</h1>
                            <p style="margin: 0 0 8px; font-size: 16px; line-height: 1.6; color: #4B5563;">Hi ${data.reviewerName},</p>
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #4B5563;">Your feedback has been rated.</p>
                            
                            <div style="background-color: #F9FAFB; border-radius: 8px; padding: 24px; margin: 24px 0;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Project:</td>
                                        <td style="padding: 8px 0; color: #1F2937; font-weight: 600; text-align: right;">${data.projectTitle}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Rating:</td>
                                        <td style="padding: 8px 0; color: #F59E0B; font-weight: 600; text-align: right; font-size: 18px;">${'⭐'.repeat(data.rating)}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">XP Earned:</td>
                                        <td style="padding: 8px 0; color: #10B981; font-weight: 700; text-align: right; font-size: 18px;">+${data.xpAwarded} XP</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #6B7280;">Great work! Keep providing valuable feedback to earn more XP and improve your rating.</p>
                            
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="https://helpmarq-frontend.vercel.app" style="display: inline-block; padding: 14px 32px; background-color: #2563EB; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View Profile</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 32px 40px; background-color: #F9FAFB; border-radius: 0 0 16px 16px; text-align: center;">
                            <p style="margin: 0 0 8px 0; font-size: 13px; color: #6B7280;"><strong>HelpMarq</strong> • Expert insights. Accessible pricing.</p>
                            <p style="margin: 0; font-size: 13px; color: #6B7280;"><a href="https://helpmarq-frontend.vercel.app" style="color: #2563EB; text-decoration: none;">Website</a> • <a href="mailto:support@helpmarq.com" style="color: #2563EB; text-decoration: none;">Support</a></p>
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
// SEND EMAIL ENGINE
// ============================================

async function sendEmail(templateName, to, data) {
    try {
        if (!emailTemplates[templateName]) {
            throw new Error(`Email template "${templateName}" not found`);
        }
        
        const template = emailTemplates[templateName](data);

        const { data: result, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: to,
            subject: template.subject,
            html: template.html
        });

        if (error) throw error;

        console.log(`✅ Email sent: ${templateName} to ${to}`);
        return { success: true, id: result?.id };
    } catch (error) {
        console.error(`❌ Email failed: ${templateName} to ${to} | ${error.message}`);
        return { success: false, error: error.message };
    }
}

// ============================================
// EXPORTS
// ============================================

export const sendOTPEmail = (email, code) => 
    sendEmail('otpVerification', email, { code });

export const sendWelcomeEmail = (user, role) => 
    sendEmail(role === 'reviewer' ? 'welcomeReviewer' : 'welcomeOwner', user.email, { name: user.name });

export const sendApplicationReceivedEmail = (ownerEmail, data) => 
    sendEmail('applicationReceived', ownerEmail, data);

export const sendApplicationApprovedEmail = (reviewerEmail, data) => 
    sendEmail('applicationApproved', reviewerEmail, data);

export const sendApplicationRejectedEmail = (reviewerEmail, data) => 
    sendEmail('applicationRejected', reviewerEmail, data);

export const sendProjectSubmittedEmail = (project) => 
    sendEmail('projectSubmitted', project.ownerEmail, {
        ownerName: project.ownerName,
        projectTitle: project.title
    });

export const sendReviewCompleteEmail = (project, feedback, reviewer) => 
    sendEmail('reviewComplete', project.ownerEmail, {
        ownerName: project.ownerName,
        reviewerName: reviewer.username,
        projectTitle: project.title
    });

export const sendRatingReceivedEmail = (reviewer, feedback, project) => 
    sendEmail('ratingReceived', reviewer.email, {
        reviewerName: reviewer.username,
        projectTitle: project.title,
        rating: feedback.ownerRating,
        xpAwarded: feedback.xpAwarded
    });