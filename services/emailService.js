import { Resend } from 'resend';

const FROM_EMAIL = 'no-reply@sapavault.com';
const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================
// EMAIL TEMPLATES
// ============================================

const emailTemplates = {
    // 1. OTP VERIFICATION EMAIL
    otpVerification: (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - HelpMarq</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F2F2F7;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F2F2F7; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 24px; text-align: center; border-bottom: 1px solid #F2F2F7;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #2C5EF0;">HelpMarq</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #1C1C1E;">Verify Your Email</h2>
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #8E8E93;">Enter this verification code to complete your registration:</p>
                            
                            <!-- OTP Code -->
                            <div style="background-color: #F2F2F7; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px;">
                                <p style="margin: 0 0 8px; font-size: 14px; color: #8E8E93; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Your Code</p>
                                <p style="margin: 0; font-size: 48px; font-weight: 700; color: #2C5EF0; letter-spacing: 8px; font-family: 'Courier New', monospace;">${data.code}</p>
                            </div>
                            
                            <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #8E8E93;">This code will expire in <strong style="color: #1C1C1E;">10 minutes</strong>.</p>
                            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #8E8E93;">If you didn't request this code, please ignore this email.</p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; background-color: #F2F2F7; border-radius: 0 0 16px 16px; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #8E8E93;">© 2026 HelpMarq. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `,

    // 2. WELCOME PROJECT OWNER EMAIL
    welcomeOwner: (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to HelpMarq</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F2F2F7;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F2F2F7; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 24px; text-align: center; border-bottom: 1px solid #F2F2F7;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #2C5EF0;">HelpMarq</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #1C1C1E;">Welcome, ${data.name}! 👋</h2>
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #8E8E93;">Your account has been created successfully. You're now ready to submit projects and receive multi-perspective feedback from our trusted reviewer community.</p>
                            
                            <div style="background-color: #F2F2F7; border-radius: 12px; padding: 24px; margin: 0 0 24px;">
                                <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 700; color: #1C1C1E;">What's Next?</h3>
                                <ul style="margin: 0; padding-left: 20px; color: #8E8E93; line-height: 1.8;">
                                    <li><strong style="color: #1C1C1E;">Submit Your First Project</strong> - Upload your work and set a deadline</li>
                                    <li><strong style="color: #1C1C1E;">Select Reviewers</strong> - Choose from expert, mid-level, or user perspectives</li>
                                    <li><strong style="color: #1C1C1E;">Receive Feedback</strong> - Get actionable insights to improve your project</li>
                                </ul>
                            </div>
                            
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="https://helpmarq.com/dashboard" style="display: inline-block; padding: 14px 32px; background-color: #2C5EF0; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Go to Dashboard</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; background-color: #F2F2F7; border-radius: 0 0 16px 16px; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #8E8E93;">© 2026 HelpMarq. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `,

    // 3. WELCOME REVIEWER EMAIL
    welcomeReviewer: (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to HelpMarq</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F2F2F7;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F2F2F7; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 24px; text-align: center; border-bottom: 1px solid #F2F2F7;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #2C5EF0;">HelpMarq</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #1C1C1E;">Welcome, ${data.name}! 🌟</h2>
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #8E8E93;">Your reviewer profile has been created successfully. Start earning XP by providing valuable feedback to project owners.</p>
                            
                            <div style="background-color: #F2F2F7; border-radius: 12px; padding: 24px; margin: 0 0 24px;">
                                <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 700; color: #1C1C1E;">How It Works</h3>
                                <ul style="margin: 0; padding-left: 20px; color: #8E8E93; line-height: 1.8;">
                                    <li><strong style="color: #1C1C1E;">Browse Available Projects</strong> - Find projects matching your expertise</li>
                                    <li><strong style="color: #1C1C1E;">Apply to Review</strong> - Submit applications for projects you're interested in</li>
                                    <li><strong style="color: #1C1C1E;">Provide Feedback</strong> - Share your insights and earn XP</li>
                                    <li><strong style="color: #1C1C1E;">Build Your Reputation</strong> - Higher ratings unlock more opportunities</li>
                                </ul>
                            </div>
                            
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="https://helpmarq.com/apply" style="display: inline-block; padding: 14px 32px; background-color: #2C5EF0; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Start Reviewing</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; background-color: #F2F2F7; border-radius: 0 0 16px 16px; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #8E8E93;">© 2026 HelpMarq. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `,

    // 4. APPLICATION RECEIVED (Owner notification)
    applicationReceived: (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Application Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F2F2F7;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F2F2F7; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 24px; text-align: center; border-bottom: 1px solid #F2F2F7;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #2C5EF0;">HelpMarq</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #1C1C1E;">New Application Received 📬</h2>
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #8E8E93;">Hello ${data.ownerName}, a reviewer has applied to review your project.</p>
                            
                            <div style="background-color: #F2F2F7; border-radius: 12px; padding: 24px; margin: 0 0 24px;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="padding: 8px 0; color: #8E8E93; font-size: 14px;">Project:</td>
                                        <td style="padding: 8px 0; color: #1C1C1E; font-weight: 600; text-align: right;">${data.projectTitle}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #8E8E93; font-size: 14px;">Reviewer:</td>
                                        <td style="padding: 8px 0; color: #1C1C1E; font-weight: 600; text-align: right;">${data.reviewerName}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #8E8E93;">Review their profile and decide whether to approve or reject their application.</p>
                            
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="https://helpmarq.com/applicants" style="display: inline-block; padding: 14px 32px; background-color: #2C5EF0; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View Application</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; background-color: #F2F2F7; border-radius: 0 0 16px 16px; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #8E8E93;">© 2026 HelpMarq. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `,

    // 5. APPLICATION APPROVED (Reviewer notification)
    applicationApproved: (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Approved</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F2F2F7;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F2F2F7; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 24px; text-align: center; border-bottom: 1px solid #F2F2F7;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #2C5EF0;">HelpMarq</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #34C759;">Congratulations! Application Approved ✅</h2>
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #8E8E93;">Hello ${data.reviewerName}, your application has been approved.</p>
                            
                            <div style="background-color: #F2F2F7; border-radius: 12px; padding: 24px; margin: 0 0 24px;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="padding: 8px 0; color: #8E8E93; font-size: 14px;">Project:</td>
                                        <td style="padding: 8px 0; color: #1C1C1E; font-weight: 600; text-align: right;">${data.projectTitle}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #8E8E93;">You can now access the full project details and submit your feedback.</p>
                            
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="https://helpmarq.com/apply" style="display: inline-block; padding: 14px 32px; background-color: #34C759; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View Project</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; background-color: #F2F2F7; border-radius: 0 0 16px 16px; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #8E8E93;">© 2026 HelpMarq. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `,

    // 6. APPLICATION REJECTED (Reviewer notification)
    applicationRejected: (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Status Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F2F2F7;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F2F2F7; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 24px; text-align: center; border-bottom: 1px solid #F2F2F7;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #2C5EF0;">HelpMarq</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #1C1C1E;">Application Not Selected</h2>
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #8E8E93;">Hello ${data.reviewerName}, thank you for your interest in reviewing this project.</p>
                            
                            <div style="background-color: #F2F2F7; border-radius: 12px; padding: 24px; margin: 0 0 24px;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="padding: 8px 0; color: #8E8E93; font-size: 14px;">Project:</td>
                                        <td style="padding: 8px 0; color: #1C1C1E; font-weight: 600; text-align: right;">${data.projectTitle}</td>
                                    </tr>
                                    ${data.reason ? `
                                    <tr>
                                        <td colspan="2" style="padding: 16px 0 0; color: #8E8E93; font-size: 14px; border-top: 1px solid #E5E5EA; margin-top: 16px;">
                                            <strong style="display: block; color: #1C1C1E; margin-bottom: 8px;">Feedback from Owner:</strong>
                                            ${data.reason}
                                        </td>
                                    </tr>
                                    ` : ''}
                                </table>
                            </div>
                            
                            <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #8E8E93;">Don't be discouraged! Keep building your profile and applying to projects that match your expertise.</p>
                            
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="https://helpmarq.com/apply" style="display: inline-block; padding: 14px 32px; background-color: #2C5EF0; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Browse More Projects</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; background-color: #F2F2F7; border-radius: 0 0 16px 16px; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #8E8E93;">© 2026 HelpMarq. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `,

    // 7. PROJECT SUBMITTED (Owner confirmation)
    projectSubmitted: (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Submitted Successfully</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F2F2F7;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F2F2F7; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 24px; text-align: center; border-bottom: 1px solid #F2F2F7;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #2C5EF0;">HelpMarq</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #34C759;">Project Submitted Successfully! 🎉</h2>
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #8E8E93;">Hello ${data.ownerName}, your project has been submitted and is now live on HelpMarq.</p>
                            
                            <div style="background-color: #F2F2F7; border-radius: 12px; padding: 24px; margin: 0 0 24px;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="padding: 8px 0; color: #8E8E93; font-size: 14px;">Project:</td>
                                        <td style="padding: 8px 0; color: #1C1C1E; font-weight: 600; text-align: right;">${data.projectTitle}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #8E8E93;">Reviewers can now discover and apply to review your project. You'll receive notifications when applications come in.</p>
                            
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="https://helpmarq.com/applicants" style="display: inline-block; padding: 14px 32px; background-color: #2C5EF0; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View Applications</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; background-color: #F2F2F7; border-radius: 0 0 16px 16px; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #8E8E93;">© 2026 HelpMarq. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `,

    // 8. REVIEW COMPLETE (Owner notification)
    reviewComplete: (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Feedback Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F2F2F7;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F2F2F7; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 24px; text-align: center; border-bottom: 1px solid #F2F2F7;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #2C5EF0;">HelpMarq</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #1C1C1E;">New Feedback Received! 📝</h2>
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #8E8E93;">Hello ${data.ownerName}, ${data.reviewerName} has submitted feedback for your project.</p>
                            
                            <div style="background-color: #F2F2F7; border-radius: 12px; padding: 24px; margin: 0 0 24px;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="padding: 8px 0; color: #8E8E93; font-size: 14px;">Project:</td>
                                        <td style="padding: 8px 0; color: #1C1C1E; font-weight: 600; text-align: right;">${data.projectTitle}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #8E8E93; font-size: 14px;">Reviewer:</td>
                                        <td style="padding: 8px 0; color: #1C1C1E; font-weight: 600; text-align: right;">${data.reviewerName}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #8E8E93;">View the feedback now and rate the reviewer's contribution.</p>
                            
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="https://helpmarq.com/feedback" style="display: inline-block; padding: 14px 32px; background-color: #2C5EF0; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View Feedback</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; background-color: #F2F2F7; border-radius: 0 0 16px 16px; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #8E8E93;">© 2026 HelpMarq. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `,

    // 9. RATING RECEIVED (Reviewer notification)
    ratingReceived: (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You Received a Rating!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F2F2F7;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F2F2F7; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 24px; text-align: center; border-bottom: 1px solid #F2F2F7;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #2C5EF0;">HelpMarq</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #34C759;">You Received a Rating! ⭐</h2>
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #8E8E93;">Hello ${data.reviewerName}, your feedback has been rated.</p>
                            
                            <div style="background-color: #F2F2F7; border-radius: 12px; padding: 24px; margin: 0 0 24px;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="padding: 8px 0; color: #8E8E93; font-size: 14px;">Project:</td>
                                        <td style="padding: 8px 0; color: #1C1C1E; font-weight: 600; text-align: right;">${data.projectTitle}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #8E8E93; font-size: 14px;">Rating:</td>
                                        <td style="padding: 8px 0; color: #FFB800; font-weight: 600; text-align: right; font-size: 18px;">${'⭐'.repeat(data.rating)}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #8E8E93; font-size: 14px;">XP Earned:</td>
                                        <td style="padding: 8px 0; color: #34C759; font-weight: 700; text-align: right; font-size: 18px;">+${data.xpAwarded} XP</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #8E8E93;">Great work! Keep providing valuable feedback to earn more XP and improve your rating.</p>
                            
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="https://helpmarq.com/profile" style="display: inline-block; padding: 14px 32px; background-color: #2C5EF0; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View Profile</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; background-color: #F2F2F7; border-radius: 0 0 16px 16px; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #8E8E93;">© 2026 HelpMarq. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `
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
        return { success: true, id: result.id };
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