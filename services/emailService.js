import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'HelpMarq <onboarding@resend.dev>';


const emailTemplates = {
    // === ONBOARDING ===
    
    welcomeOwner: (data) => ({
        subject: 'Welcome to helpmarq — Here\'s how to get started',
        html: `
            <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
                    <div style="padding: 32px 40px; background: linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%); text-align: center;">
                        <div style="font-size: 32px; font-weight: 700; color: white; margin-bottom: 8px;">helpmarq</div>
                        <div style="font-size: 14px; color: white; opacity: 0.9;">Expert insights. Accessible pricing.</div>
                    </div>
                    
                    <div style="padding: 40px;">
                        <h1 style="font-size: 24px; font-weight: 700; color: #1F2937; margin: 0 0 16px 0;">Welcome to helpmarq 👋</h1>
                        <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;">Hi ${data.name},</p>
                        <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;">Thanks for joining helpmarq. You're now part of a platform that turns uncertainty into confident action through verified, multi-perspective feedback.</p>
                        
                        <div style="background: #EFF6FF; border: 2px solid #DBEAFE; border-radius: 8px; padding: 20px; margin: 24px 0;">
                            <h3 style="font-size: 16px; font-weight: 600; color: #1E40AF; margin: 0 0 8px 0;">What makes helpmarq different:</h3>
                            <ul style="margin: 0; padding-left: 20px;">
                                <li style="font-size: 14px; color: #1F2937; margin-bottom: 8px;"><strong>Multi-perspective reviews</strong> — Expert + practitioner + user feedback, not single opinions</li>
                                <li style="font-size: 14px; color: #1F2937; margin-bottom: 8px;"><strong>Structured insights</strong> — Organized, actionable feedback you can implement immediately</li>
                                <li style="font-size: 14px; color: #1F2937; margin-bottom: 8px;"><strong>48-hour delivery</strong> — Fast turnaround without sacrificing quality</li>
                                <li style="font-size: 14px; color: #1F2937; margin-bottom: 8px;"><strong>Quality guarantee</strong> — If feedback doesn't meet standards, get your money back</li>
                            </ul>
                        </div>
                        
                        <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;"><strong>Ready to get started?</strong> Submit your first project and choose your reviewer tier. You'll receive structured feedback within 48 hours.</p>
                        
                        <center>
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/index.html" style="display: inline-block; background: #2563EB; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 24px 0;">Submit Your First Project</a>
                        </center>
                        
                        <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;">Have questions? Reply to this email or check out our <a href="https://helpmarq.com/faq" style="color: #2563EB; text-decoration: none;">FAQ page</a>.</p>
                        <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0;">— The helpmarq team</p>
                    </div>
                    
                    <div style="padding: 32px 40px; background: #F9FAFB; border-top: 1px solid #E5E7EB; text-align: center;">
                        <p style="font-size: 13px; color: #6B7280; margin: 0 0 8px 0;"><strong>helpmarq</strong> • Expert insights. Accessible pricing.</p>
                        <p style="font-size: 13px; color: #6B7280; margin: 0;"><a href="https://helpmarq.com" style="color: #2563EB; text-decoration: none;">Website</a> • <a href="https://instagram.com/helpmarq" style="color: #2563EB; text-decoration: none;">Instagram</a> • <a href="mailto:support@helpmarq.com" style="color: #2563EB; text-decoration: none;">Support</a></p>
                    </div>
                </div>
            </div>
        `
    }),

    welcomeReviewer: (data) => ({
        subject: 'Welcome to helpmarq — Start reviewing and earning',
        html: `
            <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
                    <div style="padding: 32px 40px; background: linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%); text-align: center;">
                        <div style="font-size: 32px; font-weight: 700; color: white; margin-bottom: 8px;">helpmarq</div>
                        <div style="font-size: 14px; color: white; opacity: 0.9;">Expert insights. Accessible pricing.</div>
                    </div>
                    
                    <div style="padding: 40px;">
                        <h1 style="font-size: 24px; font-weight: 700; color: #1F2937; margin: 0 0 16px 0;">Welcome, ${data.name} 👋</h1>
                        <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;">You're now part of helpmarq's reviewer community. Your expertise will help project creators make better decisions.</p>
                        
                        <div style="background: #EFF6FF; border: 2px solid #DBEAFE; border-radius: 8px; padding: 20px; margin: 24px 0;">
                            <h3 style="font-size: 16px; font-weight: 600; color: #1E40AF; margin: 0 0 8px 0;">How it works:</h3>
                            <ul style="margin: 0; padding-left: 20px;">
                                <li style="font-size: 14px; color: #1F2937; margin-bottom: 8px;"><strong>Browse projects</strong> — Find projects matching your expertise</li>
                                <li style="font-size: 14px; color: #1F2937; margin-bottom: 8px;"><strong>Apply to review</strong> — Submit a brief application explaining your qualifications</li>
                                <li style="font-size: 14px; color: #1F2937; margin-bottom: 8px;"><strong>Get approved</strong> — Project owners select reviewers based on expertise and fit</li>
                                <li style="font-size: 14px; color: #1F2937; margin-bottom: 8px;"><strong>Deliver feedback</strong> — Provide structured, actionable insights within 48 hours</li>
                                <li style="font-size: 14px; color: #1F2937; margin-bottom: 8px;"><strong>Earn XP</strong> — Build your reputation and level up</li>
                            </ul>
                        </div>
                        
                        <center>
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/index.html" style="display: inline-block; background: #8B5CF6; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 24px 0;">Browse Available Projects</a>
                        </center>
                        
                        <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;">Questions? Reply to this email anytime.</p>
                        <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0;">— The helpmarq team</p>
                    </div>
                    
                    <div style="padding: 32px 40px; background: #F9FAFB; border-top: 1px solid #E5E7EB; text-align: center;">
                        <p style="font-size: 13px; color: #6B7280; margin: 0 0 8px 0;"><strong>helpmarq</strong> • Expert insights. Accessible pricing.</p>
                        <p style="font-size: 13px; color: #6B7280; margin: 0;"><a href="https://helpmarq.com" style="color: #2563EB; text-decoration: none;">Website</a> • <a href="https://instagram.com/helpmarq" style="color: #2563EB; text-decoration: none;">Instagram</a> • <a href="mailto:support@helpmarq.com" style="color: #2563EB; text-decoration: none;">Support</a></p>
                    </div>
                </div>
            </div>
        `
    }),

    // === PROJECT LIFECYCLE ===
    
    projectSubmitted: (data) => ({
        subject: `Your project "${data.projectTitle}" is live on helpmarq`,
        html: `
            <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
                    <div style="padding: 32px 40px; background: linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%); text-align: center;">
                        <div style="font-size: 32px; font-weight: 700; color: white; margin-bottom: 8px;">helpmarq</div>
                        <div style="font-size: 14px; color: white; opacity: 0.9;">Expert insights. Accessible pricing.</div>
                    </div>
                    
                    <div style="padding: 40px;">
                        <h1 style="font-size: 24px; font-weight: 700; color: #1F2937; margin: 0 0 16px 0;">Project submitted successfully ✓</h1>
                        <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;">Hi ${data.name},</p>
                        <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;">Your project <strong>"${data.projectTitle}"</strong> is now live and visible to our reviewer community.</p>
                        
                        <div style="background: #ECFDF5; border: 2px solid #A7F3D0; border-radius: 8px; padding: 20px; margin: 24px 0;">
                            <h3 style="font-size: 16px; font-weight: 600; color: #059669; margin: 0 0 8px 0;">What happens next:</h3>
                            <ul style="margin: 0; padding-left: 20px;">
                                <li style="font-size: 14px; color: #1F2937; margin-bottom: 8px;">Qualified reviewers will apply to review your project</li>
                                <li style="font-size: 14px; color: #1F2937; margin-bottom: 8px;">You'll receive email notifications for each application</li>
                                <li style="font-size: 14px; color: #1F2937; margin-bottom: 8px;">Approve the reviewers that best fit your needs</li>
                                <li style="font-size: 14px; color: #1F2937; margin-bottom: 8px;">Approved reviewers deliver feedback within 48 hours</li>
                            </ul>
                        </div>
                        
                        <center>
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/index.html" style="display: inline-block; background: #2563EB; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 24px 0;">View Your Project</a>
                        </center>
                        
                        <p style="font-size: 14px; color: #6B7280; line-height: 1.6; margin: 0;"><strong>💡 Pro tip:</strong> Most projects receive their first applications within 2-4 hours. Check your dashboard regularly to review and approve applicants.</p>
                    </div>
                    
                    <div style="padding: 32px 40px; background: #F9FAFB; border-top: 1px solid #E5E7EB; text-align: center;">
                        <p style="font-size: 13px; color: #6B7280; margin: 0 0 8px 0;"><strong>helpmarq</strong> • Expert insights. Accessible pricing.</p>
                        <p style="font-size: 13px; color: #6B7280; margin: 0;"><a href="https://helpmarq.com" style="color: #2563EB; text-decoration: none;">Website</a> • <a href="mailto:support@helpmarq.com" style="color: #2563EB; text-decoration: none;">Support</a></p>
                    </div>
                </div>
            </div>
        `
    }),

    // === REVIEWER WORKFLOW ===
    
    applicationReceived: (data) => ({
        subject: `New application for "${data.projectTitle}"`,
        html: `
            <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
                    <div style="padding: 32px 40px; background: linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%); text-align: center;">
                        <div style="font-size: 32px; font-weight: 700; color: white; margin-bottom: 8px;">helpmarq</div>
                        <div style="font-size: 14px; color: white; opacity: 0.9;">Expert insights. Accessible pricing.</div>
                    </div>
                    
                    <div style="padding: 40px;">
                        <h1 style="font-size: 24px; font-weight: 700; color: #1F2937; margin: 0 0 16px 0;">New reviewer application 📋</h1>
                        <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;"><strong>${data.reviewerName}</strong> (Level ${data.reviewerLevel}, ${data.reviewerXP} XP) has applied to review your project <strong>"${data.projectTitle}"</strong>.</p>
                        
                        <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin: 24px 0;">
                            <p style="font-size: 14px; color: #1F2937; margin: 0 0 12px 0;"><strong>Reviewer Stats:</strong></p>
                            <p style="font-size: 14px; color: #6B7280; margin: 0 0 8px 0;">📊 ${data.reviewerReviews} reviews completed • ${data.reviewerRating}⭐ average rating</p>
                            
                            <p style="font-size: 14px; color: #1F2937; margin: 16px 0 8px 0;"><strong>Why they're qualified:</strong></p>
                            <p style="font-size: 14px; color: #4B5563; font-style: italic; margin: 0;">"${data.qualifications}"</p>
                            
                            <p style="font-size: 14px; color: #1F2937; margin: 16px 0 8px 0;"><strong>Review focus areas:</strong></p>
                            <p style="font-size: 14px; color: #4B5563; font-style: italic; margin: 0;">"${data.focusAreas}"</p>
                        </div>
                        
                        <center>
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/index.html" style="display: inline-block; background: #2563EB; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 24px 0;">Review Application</a>
                        </center>
                        
                        <p style="font-size: 14px; color: #6B7280; line-height: 1.6; margin: 0;"><strong>💡 Tip:</strong> Approve multiple reviewers for diverse perspectives. Most project owners approve 2-3 reviewers per project.</p>
                    </div>
                    
                    <div style="padding: 32px 40px; background: #F9FAFB; border-top: 1px solid #E5E7EB; text-align: center;">
                        <p style="font-size: 13px; color: #6B7280; margin: 0 0 8px 0;"><strong>helpmarq</strong> • Expert insights. Accessible pricing.</p>
                        <p style="font-size: 13px; color: #6B7280; margin: 0;"><a href="https://helpmarq.com" style="color: #2563EB; text-decoration: none;">Website</a> • <a href="mailto:support@helpmarq.com" style="color: #2563EB; text-decoration: none;">Support</a></p>
                    </div>
                </div>
            </div>
        `
    }),

    applicationApproved: (data) => ({
        subject: `✅ You're approved! Review "${data.projectTitle}"`,
        html: `
            <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
                    <div style="padding: 32px 40px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 8px;">🎉</div>
                        <div style="font-size: 24px; font-weight: 700; color: white;">Application Approved!</div>
                    </div>
                    
                    <div style="padding: 40px;">
                        <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;">Congratulations! Your application to review <strong>"${data.projectTitle}"</strong> has been approved by the project owner.</p>
                        
                        <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 24px; border-radius: 8px; text-align: center; margin: 24px 0;">
                            <p style="font-size: 14px; margin: 0 0 4px 0; opacity: 0.9;">XP Reward</p>
                            <p style="font-size: 36px; font-weight: 700; margin: 0;">+${data.xpReward} XP</p>
                            <p style="font-size: 14px; margin: 4px 0 0 0; opacity: 0.9;">upon completion</p>
                        </div>
                        
                        <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin: 24px 0;">
                            <p style="font-size: 14px; color: #1F2937; margin: 0 0 8px 0;"><strong>Project Details:</strong></p>
                            <p style="font-size: 14px; color: #6B7280; margin: 0;">Type: ${data.projectType}</p>
                            <p style="font-size: 14px; color: #6B7280; margin: 0;">Owner: ${data.ownerName}</p>
                            <p style="font-size: 14px; color: #6B7280; margin: 0;">Link: <a href="${data.projectLink}" style="color: #2563EB;">${data.projectLink}</a></p>
                        </div>
                        
                        <div style="background: #FEE2E2; border: 2px solid #FCA5A5; border-radius: 8px; padding: 20px; margin: 24px 0;">
                            <h3 style="font-size: 16px; font-weight: 600; color: #DC2626; margin: 0 0 8px 0;">⚠️ NDA Reminder</h3>
                            <p style="font-size: 14px; color: #1F2937; margin: 0;">You agreed to keep all project information confidential. Do not share, copy, or distribute any project content.</p>
                        </div>
                        
                        <center>
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/index.html" style="display: inline-block; background: #10B981; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 24px 0;">Start Your Review</a>
                        </center>
                        
                        <p style="font-size: 14px; color: #6B7280; line-height: 1.6; margin: 0;"><strong>💡 Tip:</strong> Detailed, actionable feedback earns higher ratings and more XP!</p>
                    </div>
                    
                    <div style="padding: 32px 40px; background: #F9FAFB; border-top: 1px solid #E5E7EB; text-align: center;">
                        <p style="font-size: 13px; color: #6B7280; margin: 0 0 8px 0;"><strong>helpmarq</strong> • Expert insights. Accessible pricing.</p>
                        <p style="font-size: 13px; color: #6B7280; margin: 0;"><a href="https://helpmarq.com" style="color: #2563EB; text-decoration: none;">Website</a> • <a href="mailto:support@helpmarq.com" style="color: #2563EB; text-decoration: none;">Support</a></p>
                    </div>
                </div>
            </div>
        `
    }),

    applicationRejected: (data) => ({
        subject: `Update on your application for "${data.projectTitle}"`,
        html: `
            <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
                    <div style="padding: 32px 40px; background: linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%); text-align: center;">
                        <div style="font-size: 32px; font-weight: 700; color: white; margin-bottom: 8px;">helpmarq</div>
                        <div style="font-size: 14px; color: white; opacity: 0.9;">Expert insights. Accessible pricing.</div>
                    </div>
                    
                    <div style="padding: 40px;">
                        <h1 style="font-size: 24px; font-weight: 700; color: #1F2937; margin: 0 0 16px 0;">Application update</h1>
                        <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;">Thank you for applying to review <strong>"${data.projectTitle}"</strong>.</p>
                        <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;">Unfortunately, the project owner chose other reviewers for this project. This happens for various reasons — sometimes they need specific expertise, or they've already received enough applications.</p>
                        
                        <div style="background: #EFF6FF; border: 2px solid #DBEAFE; border-radius: 8px; padding: 20px; margin: 24px 0;">
                            <h3 style="font-size: 16px; font-weight: 600; color: #1E40AF; margin: 0 0 8px 0;">Keep going! 💪</h3>
                            <p style="font-size: 14px; color: #1F2937; margin: 0;">There are plenty of projects waiting for your expertise. The more you apply, the better your chances of getting approved.</p>
                        </div>
                        
                        <p style="font-size: 16px; color: #1F2937; font-weight: 600; margin: 16px 0 8px 0;">Tips to improve your applications:</p>
                        <ul style="margin: 0 0 24px 20px; padding: 0;">
                            <li style="font-size: 14px; color: #4B5563; margin-bottom: 8px;">Highlight specific relevant experience</li>
                            <li style="font-size: 14px; color: #4B5563; margin-bottom: 8px;">Explain exactly what you'll focus on</li>
                            <li style="font-size: 14px; color: #4B5563; margin-bottom: 8px;">Show enthusiasm for the project</li>
                            <li style="font-size: 14px; color: #4B5563; margin-bottom: 8px;">Build your XP and rating over time</li>
                        </ul>
                        
                        <center>
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/index.html" style="display: inline-block; background: #2563EB; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 24px 0;">Browse New Projects</a>
                        </center>
                    </div>
                    
                    <div style="padding: 32px 40px; background: #F9FAFB; border-top: 1px solid #E5E7EB; text-align: center;">
                        <p style="font-size: 13px; color: #6B7280; margin: 0 0 8px 0;"><strong>helpmarq</strong> • Expert insights. Accessible pricing.</p>
                        <p style="font-size: 13px; color: #6B7280; margin: 0;"><a href="https://helpmarq.com" style="color: #2563EB; text-decoration: none;">Website</a> • <a href="mailto:support@helpmarq.com" style="color: #2563EB; text-decoration: none;">Support</a></p>
                    </div>
                </div>
            </div>
        `
    }),

    reviewComplete: (data) => ({
        subject: `📬 New feedback on "${data.projectTitle}"`,
        html: `
            <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
                    <div style="padding: 32px 40px; background: linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%); text-align: center;">
                        <div style="font-size: 32px; font-weight: 700; color: white; margin-bottom: 8px;">helpmarq</div>
                        <div style="font-size: 14px; color: white; opacity: 0.9;">Expert insights. Accessible pricing.</div>
                    </div>
                    
                    <div style="padding: 40px;">
                        <h1 style="font-size: 24px; font-weight: 700; color: #1F2937; margin: 0 0 16px 0;">You've got feedback! 💬</h1>
                        <p style="font-size: 16px; color: #4B5563;line-height: 1.6; margin: 0 0 16px 0;"><strong>${data.reviewerName}</strong> has submitted their review of <strong>"${data.projectTitle}"</strong>.</p><div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin: 24px 0;">
                        <h3 style="font-size: 16px; font-weight: 600; color: #1F2937; margin: 0 0 12px 0;">Feedback Preview:</h3>
                        <p style="font-size: 14px; color: #4B5563; font-style: italic; margin: 0;">"${data.feedbackPreview}${data.feedbackPreview.length > 150 ? '...' : ''}"</p>
                        ${data.projectRating ? `<p style="font-size: 14px; color: #1F2937; margin: 12px 0 0 0;"><strong>Project Rating:</strong> ${'⭐'.repeat(data.projectRating)}</p>` : ''}
                    </div>
                    
                    <div style="background: #FEF3C7; border: 2px solid #FDE68A; border-radius: 8px; padding: 20px; margin: 24px 0;">
                        <h3 style="font-size: 16px; font-weight: 600; color: #D97706; margin: 0 0 8px 0;">⚡ Action required: Rate this feedback</h3>
                        <p style="font-size: 14px; color: #1F2937; margin: 0 0 8px 0;">Help us maintain quality by rating this review. Your rating determines how much XP the reviewer earns!</p>
                        <p style="font-size: 14px; color: #1F2937; margin: 0;"><strong>5 stars:</strong> 150 XP<br><strong>4 stars:</strong> 125 XP<br><strong>3 stars:</strong> 100 XP</p>
                    </div>
                    
                    <center>
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/index.html" style="display: inline-block; background: #2563EB; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 24px 0;">View Full Feedback & Rate</a>
                    </center>
                </div>
                
                <div style="padding: 32px 40px; background: #F9FAFB; border-top: 1px solid #E5E7EB; text-align: center;">
                    <p style="font-size: 13px; color: #6B7280; margin: 0 0 8px 0;"><strong>helpmarq</strong> • Expert insights. Accessible pricing.</p>
                    <p style="font-size: 13px; color: #6B7280; margin: 0;"><a href="https://helpmarq.com" style="color: #2563EB; text-decoration: none;">Website</a> • <a href="mailto:support@helpmarq.com" style="color: #2563EB; text-decoration: none;">Support</a></p>
                </div>
            </div>
        </div>
    `
}),

ratingReceived: (data) => ({
    subject: `⭐ You earned ${data.xpAwarded} XP for "${data.projectTitle}"!`,
    html: `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
                <div style="padding: 32px 40px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 8px;">🎉</div>
                    <div style="font-size: 24px; font-weight: 700; color: white;">Feedback Rated!</div>
                </div>
                
                <div style="padding: 40px;">
                    <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;">Great news! The owner of <strong>"${data.projectTitle}"</strong> has rated your feedback.</p>
                    
                    <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin: 24px 0;">
                        <p style="font-size: 14px; margin: 0 0 8px 0; opacity: 0.9;">Rating Received</p>
                        <p style="font-size: 48px; margin: 10px 0;">${'⭐'.repeat(data.rating)}</p>
                        <p style="font-size: 36px; font-weight: 700; margin: 10px 0;">+${data.xpAwarded} XP</p>
                    </div>
                    
                    <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin: 24px 0;">
                        <h3 style="font-size: 16px; font-weight: 600; color: #1F2937; margin: 0 0 12px 0;">Your Updated Stats:</h3>
                        <p style="font-size: 14px; color: #6B7280; margin: 0;"><strong>Level:</strong> ${data.newLevel}</p>
                        <p style="font-size: 14px; color: #6B7280; margin: 0;"><strong>Total XP:</strong> ${data.totalXP}</p>
                        <p style="font-size: 14px; color: #6B7280; margin: 0;"><strong>Total Reviews:</strong> ${data.totalReviews}</p>
                        <p style="font-size: 14px; color: #6B7280; margin: 0;"><strong>Average Rating:</strong> ${data.avgRating}⭐</p>
                    </div>
                    
                    ${data.leveledUp ? `
                    <div style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; padding: 20px; border-radius: 8px; margin: 24px 0; text-align: center;">
                        <h2 style="font-size: 24px; margin: 0 0 8px 0;">🎊 LEVEL UP! 🎊</h2>
                        <p style="font-size: 20px; margin: 0;">You've reached Level ${data.newLevel}!</p>
                    </div>
                    ` : ''}
                    
                    <center>
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/index.html" style="display: inline-block; background: #10B981; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 24px 0;">View Your Profile</a>
                    </center>
                    
                    <p style="font-size: 14px; color: #6B7280; line-height: 1.6; margin: 0;">Keep up the great work! ${data.rating === 5 ? 'Perfect score — you\'re crushing it! 🔥' : 'Quality feedback builds your reputation!'}</p>
                </div>
                
                <div style="padding: 32px 40px; background: #F9FAFB; border-top: 1px solid #E5E7EB; text-align: center;">
                    <p style="font-size: 13px; color: #6B7280; margin: 0 0 8px 0;"><strong>helpmarq</strong> • Expert insights. Accessible pricing.</p>
                    <p style="font-size: 13px; color: #6B7280; margin: 0;"><a href="https://helpmarq.com" style="color: #2563EB; text-decoration: none;">Website</a> • <a href="mailto:support@helpmarq.com" style="color: #2563EB; text-decoration: none;">Support</a></p>
                </div>
            </div>
        </div>
    `
    
})};
deadlineReminder: (data) => ({
        subject: `⏰ ${data.hoursLeft}h left to review "${data.projectTitle}"`,
        html: `
            <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
                    <div style="padding: 32px 40px; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 8px;">⏰</div>
                        <div style="font-size: 24px; font-weight: 700; color: white;">Deadline Approaching!</div>
                    </div>
                    
                    <div style="padding: 40px;">
                        <h1 style="font-size: 24px; font-weight: 700; color: #1F2937; margin: 0 0 16px 0;">Friendly reminder</h1>
                        <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;">You have <strong>${data.hoursLeft} hours</strong> remaining to submit your review for <strong>"${data.projectTitle}"</strong>.</p>
                        
                        <div style="background: #FEF3C7; border: 2px solid #FDE68A; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
                            <p style="font-size: 36px; font-weight: 700; color: #D97706; margin: 0 0 8px 0;">${data.hoursLeft}h</p>
                            <p style="font-size: 14px; color: #1F2937; margin: 0;">Until deadline</p>
                        </div>
                        
                        <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;">Please submit your feedback before the deadline to ensure the project owner receives timely insights.</p>
                        
                        <center>
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/index.html" style="display: inline-block; background: #F59E0B; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 24px 0;">Submit Feedback Now</a>
                        </center>
                        
                        <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px; margin: 24px 0;">
                            <p style="font-size: 14px; color: #6B7280; margin: 0;"><strong>Project Link:</strong><br><a href="${data.projectLink}" style="color: #2563EB;">${data.projectLink}</a></p>
                        </div>
                    </div>
                    
                    <div style="padding: 32px 40px; background: #F9FAFB; border-top: 1px solid #E5E7EB; text-align: center;">
                        <p style="font-size: 13px; color: #6B7280; margin: 0 0 8px 0;"><strong>helpmarq</strong> • Expert insights. Accessible pricing.</p>
                        <p style="font-size: 13px; color: #6B7280; margin: 0;"><a href="https://helpmarq.com" style="color: #2563EB; text-decoration: none;">Website</a> • <a href="mailto:support@helpmarq.com" style="color: #2563EB; text-decoration: none;">Support</a></p>
                    </div>
                </div>
            </div>
        `
    })


// Send Email Function
async function sendEmail(templateName, to, data) {
    try {
        const template = emailTemplates[templateName](data);
        
        const result = await resend.emails.send({
            from: FROM_EMAIL,
            to: to,
            subject: template.subject,
            html: template.html
        });
        
        console.log(`✅ Email sent: ${templateName} to ${to}`);
        return { success: true, id: result.id };
        
    } catch (error) {
        console.error(`❌ Email failed: ${templateName} to ${to}`, error);
        return { success: false, error: error.message };
    }
}

export { sendEmail };