import { Resend } from 'resend';
const FROM_EMAIL = 'no-reply@sapavault.com';
const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================
// BRAND TOKENS — single source of truth
// ============================================
const B = {
  primary:  '#2563EB',
  purple:   '#8B5CF6',
  dark:     '#1F2937',
  body:     '#4B5563',
  muted:    '#6B7280',
  white:    '#FFFFFF',
  lightBg:  '#F9FAFB',
  border:   '#E5E7EB',
  cardBg:   '#F2F2F7',
  // Info box
  infoBg:   '#EFF6FF',  infoBorder:  '#DBEAFE', infoTitle:  '#1E40AF',
  // Success box
  okBg:     '#ECFDF5',  okBorder:    '#A7F3D0', okTitle:    '#059669',
  // Warning box
  warnBg:   '#FEF3C7',  warnBorder:  '#FDE68A', warnTitle:  '#D97706',
  // URLs
  app:      'https://helpmarq-frontend.vercel.app'
};

// ============================================
// LAYOUT PRIMITIVES
// Every email is built by composing these.
// ============================================

// Full email shell: gradient header + body slot + branded footer
const wrap = (body) => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:${B.lightBg};">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:${B.lightBg};padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background-color:${B.white};border-radius:8px;overflow:hidden;border:1px solid ${B.border};">

<!-- HEADER — gradient + logo + tagline -->
<tr><td style="padding:32px 40px;background-color:${B.primary};background:linear-gradient(135deg,${B.primary} 0%,${B.purple} 100%);text-align:center;">
<p style="margin:0 0 6px;font-size:30px;font-weight:700;color:${B.white};">helpmarq</p>
<p style="margin:0;font-size:14px;color:${B.white};opacity:0.9;">Expert insights. Accessible pricing.</p>
</td></tr>

<!-- BODY -->
<tr><td style="padding:40px;">
${body}
</td></tr>

<!-- FOOTER -->
<tr><td style="padding:28px 40px;background-color:${B.lightBg};border-top:1px solid ${B.border};text-align:center;">
<p style="margin:0 0 6px;font-size:13px;color:${B.muted};"><strong>helpmarq</strong> · Expert insights. Accessible pricing.</p>
<p style="margin:0;font-size:13px;"><a href="https://helpmarq.com" style="color:${B.primary};text-decoration:none;">Website</a> · <a href="mailto:support@helpmarq.com" style="color:${B.primary};text-decoration:none;">Support</a></p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

// H1 heading
const h1 = (t) =>
  `<h1 style="font-size:24px;font-weight:700;color:${B.dark};margin:0 0 16px;">${t}</h1>`;

// Body paragraph
const p = (t) =>
  `<p style="font-size:16px;color:${B.body};line-height:1.6;margin:0 0 16px;">${t}</p>`;

// Muted / small paragraph
const pm = (t) =>
  `<p style="font-size:14px;color:${B.muted};line-height:1.6;margin:0 0 16px;">${t}</p>`;

// Sign-off line
const sign = () =>
  `<p style="font-size:16px;color:${B.body};margin:24px 0 0;">— The helpmarq team</p>`;

// Primary CTA button (centered)
const btn = (label, url) =>
  `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td align="center">
<a href="${url}" style="display:inline-block;background-color:${B.primary};color:${B.white};padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">${label}</a>
</td></tr></table>`;

// Branded info / success / warning box
// content = string (renders as <p>) or string[] (renders as <ul>)
// type = 'info' | 'success' | 'warning'
const box = (title, content, type = 'info') => {
  const map = {
    info:    [B.infoBg,  B.infoBorder,  B.infoTitle],
    success: [B.okBg,    B.okBorder,    B.okTitle],
    warning: [B.warnBg,  B.warnBorder,  B.warnTitle]
  };
  const [bg, border, titleColor] = map[type] || map.info;
  const inner = Array.isArray(content)
    ? `<ul style="margin:0;padding-left:20px;">${content.map(i =>
        `<li style="font-size:14px;color:${B.dark};margin-bottom:8px;line-height:1.5;">${i}</li>`
      ).join('')}</ul>`
    : `<p style="margin:0;font-size:14px;color:${B.dark};line-height:1.5;">${content}</p>`;
  return `<div style="background-color:${bg};border:2px solid ${border};border-radius:8px;padding:20px;margin:24px 0;">
<h3 style="margin:0 0 10px;font-size:16px;font-weight:600;color:${titleColor};">${title}</h3>${inner}</div>`;
};

// Gray key → value detail card
// rows = [['Label', 'Value'], ...]
const card = (rows) =>
  `<div style="background-color:${B.cardBg};border-radius:12px;padding:20px 24px;margin:24px 0;">
<table width="100%" cellpadding="0" cellspacing="0">
${rows.map(([label, value]) =>
  `<tr>
<td style="padding:7px 0;color:${B.muted};font-size:14px;">${label}</td>
<td style="padding:7px 0;color:${B.dark};font-weight:600;text-align:right;font-size:14px;">${value}</td>
</tr>`).join('')}
</table></div>`;

// Left-border description / quote block
const quote = (text, color = B.primary) =>
  `<div style="background-color:${B.lightBg};padding:16px;border-radius:8px;border-left:4px solid ${color};margin:16px 0;">
<p style="margin:0;font-size:14px;color:${B.dark};line-height:1.6;">${text}</p></div>`;

// Sub-heading inside body (not h1, smaller)
const h3 = (t) =>
  `<p style="font-size:15px;font-weight:600;color:${B.dark};margin:20px 0 8px;">${t}</p>`;

// ============================================
// EMAIL TEMPLATES
// All dynamic fields use conditional rendering
// so existing calls without them still work.
// ============================================
const emailTemplates = {

// ──────────────────────────────────────────
// 1. OTP VERIFICATION
// data: { code, name? }
// ──────────────────────────────────────────
otpVerification: (data) => ({
  subject: 'Verify your email – helpmarq',
  html: wrap(`
    ${h1('Verify your email address')}
    ${p(`Hi ${data.name || 'there'},`)}
    ${p('Thanks for signing up for helpmarq. Enter the code below to complete your registration.')}
    <div style="background-color:${B.cardBg};border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
      <p style="margin:0 0 8px;font-size:13px;color:${B.muted};text-transform:uppercase;letter-spacing:1px;font-weight:600;">Verification Code</p>
      <p style="margin:0;font-size:46px;font-weight:700;color:${B.primary};letter-spacing:8px;font-family:'Courier New',monospace;">${data.code}</p>
    </div>
    ${pm(`This code expires in <strong style="color:${B.dark};">10 minutes</strong>.`)}
    ${pm("If you didn't request this code, you can safely ignore this email.")}
  `)
}),

// ──────────────────────────────────────────
// 2. WELCOME — PROJECT OWNER
// data: { name }
// ──────────────────────────────────────────
welcomeOwner: (data) => ({
  subject: 'Welcome to helpmarq — Here\'s how to get started',
  html: wrap(`
    ${h1('Welcome to helpmarq 👋')}
    ${p(`Hi ${data.name},`)}
    ${p("You're now part of a platform that turns uncertainty into confident action through verified, multi-perspective feedback.")}
    ${box('What makes helpmarq different:', [
      '<strong>Multi-perspective reviews</strong> — Expert + practitioner + user feedback, not single opinions',
      '<strong>Structured insights</strong> — Organized, actionable feedback you can implement immediately',
      '<strong>48-hour delivery</strong> — Fast turnaround without sacrificing quality',
      '<strong>Quality guarantee</strong> — If feedback doesn\'t meet standards, get your money back'
    ])}
    ${p("<strong>Ready to get started?</strong> Submit your first project and you'll receive structured feedback within 48 hours.")}
    ${btn('Submit Your First Project', `${B.app}/submit`)}
    ${p(`Have questions? Reply to this email or check out our <a href="https://helpmarq.com/faq" style="color:${B.primary};">FAQ page</a>.`)}
    ${sign()}
  `)
}),

// ──────────────────────────────────────────
// 3. WELCOME — REVIEWER
// data: { name, tier? }
// ──────────────────────────────────────────
welcomeReviewer: (data) => ({
  subject: 'You\'re approved — Start reviewing on helpmarq',
  html: wrap(`
    ${h1('You\'re approved! ✅')}
    ${p(`Hi ${data.name},`)}
    ${p('Congratulations! Your reviewer profile has been approved. You can now start earning XP by providing valuable feedback on helpmarq.')}
    ${box('How helpmarq works for reviewers:', [
      '<strong>Browse projects</strong> — Find projects that match your expertise and interests',
      '<strong>Apply to review</strong> — Submit applications for projects you\'re confident in',
      '<strong>Complete structured reviews</strong> — Use our templates for clear, organized feedback',
      '<strong>Build your reputation</strong> — Ratings and testimonials showcase your expertise'
    ])}
    ${data.tier ? card([['Reviewer Tier', data.tier]]) : ''}
    ${p('Ready to earn? Browse available projects and claim your first review.')}
    ${btn('Browse Available Projects', `${B.app}/projects`)}
    ${p('<strong>Important:</strong> Complete reviews within the agreed timeline and maintain quality standards to keep your reviewer status active.')}
    ${sign()}
  `)
}),

// ──────────────────────────────────────────
// 4. APPLICATION RECEIVED — notifies PROJECT OWNER
// data: { ownerName, reviewerName, projectTitle,
//         projectDescription?, reviewerMessage? }
// ──────────────────────────────────────────
applicationReceived: (data) => ({
  subject: `New Application: ${data.reviewerName} wants to review "${data.projectTitle}"`,
  html: wrap(`
    ${h1('New Application Received 📬')}
    ${p(`Hello ${data.ownerName}, a reviewer has applied to review your project.`)}
    ${card([
      ['Project',  data.projectTitle],
      ['Reviewer', data.reviewerName]
    ])}
    ${data.projectDescription
      ? h3('Project Description') + quote(data.projectDescription)
      : ''}
    ${data.reviewerMessage
      ? h3("Reviewer's Note") + quote(data.reviewerMessage, B.purple)
      : ''}
    ${pm('Review their profile and decide whether to approve or reject their application.')}
    ${btn('View Application', B.app)}
    ${sign()}
  `)
}),

// ──────────────────────────────────────────
// 5. APPLICATION APPROVED — notifies REVIEWER
// data: { reviewerName, projectTitle,
//         projectDescription?, projectType?, deadline? }
// ──────────────────────────────────────────
applicationApproved: (data) => ({
  subject: `Approved! You can now review "${data.projectTitle}"`,
  html: wrap(`
    ${h1('Congratulations! Application Approved ✅')}
    ${p(`Hello ${data.reviewerName}, your application has been approved!`)}
    ${card([
      ['Project', data.projectTitle],
      ...(data.projectType ? [['Type', data.projectType]]   : []),
      ...(data.deadline    ? [['Deadline', data.deadline]]   : [])
    ])}
    ${data.projectDescription
      ? h3('Project Description') + quote(data.projectDescription)
      : ''}
    ${box('What happens next:', [
      'Access the full project details and materials',
      'Complete your structured review using our templates',
      'Submit your feedback before the deadline'
    ], 'success')}
    ${btn('View Project & Start Review', `${B.app}/projects`)}
    ${sign()}
  `)
}),

// ──────────────────────────────────────────
// 6. APPLICATION REJECTED — notifies REVIEWER
// data: { reviewerName, projectTitle, reason? }
// ──────────────────────────────────────────
applicationRejected: (data) => ({
  subject: `Application Update: "${data.projectTitle || 'Project'}"`,
  html: wrap(`
    ${h1('Application Not Selected')}
    ${p(`Hello ${data.reviewerName}, thank you for your interest in reviewing this project.`)}
    ${card([
      ['Project', data.projectTitle || 'N/A']
    ])}
    ${data.reason
      ? box('Feedback from Owner:', data.reason, 'warning')
      : ''}
    ${p("Don't be discouraged! Keep building your profile and applying to projects that match your expertise.")}
    ${btn('Browse More Projects', `${B.app}/projects`)}
    ${sign()}
  `)
}),

// ──────────────────────────────────────────
// 7. PROJECT SUBMITTED — confirms to OWNER
// data: { ownerName, projectTitle,
//         projectDescription?, projectType?,
//         reviewerCount?, deadline? }
// ──────────────────────────────────────────
projectSubmitted: (data) => ({
  subject: `Project Submitted: "${data.projectTitle}"`,
  html: wrap(`
    ${h1('Project submitted successfully ✓')}
    ${p(`Hi ${data.ownerName},`)}
    ${p(`We've received your project <strong>${data.projectTitle}</strong> and it's now live on helpmarq.`)}
    ${card([
      ['Project', data.projectTitle],
      ...(data.projectType   ? [['Type', data.projectType]]            : []),
      ...(data.reviewerCount ? [['Reviewers needed', data.reviewerCount]] : []),
      ...(data.deadline      ? [['Deadline', data.deadline]]           : [])
    ])}
    ${data.projectDescription
      ? h3('Project Description') + quote(data.projectDescription)
      : ''}
    ${box('What happens next:', [
      '<strong>Now:</strong> Your project is visible to reviewers on the platform',
      '<strong>Soon:</strong> Reviewers will discover and apply to your project',
      '<strong>You decide:</strong> Approve or reject each application directly'
    ])}
    ${p("You'll receive notifications as applications come in. Track everything in your dashboard.")}
    ${btn('View Project Status', B.app)}
    ${sign()}
  `)
}),

// ──────────────────────────────────────────
// 8. REVIEW COMPLETE — notifies OWNER
// data: { ownerName, reviewerName, projectTitle,
//         reviewerTier?, feedbackPreview? }
// ──────────────────────────────────────────
reviewComplete: (data) => ({
  subject: `New Feedback Received for "${data.projectTitle}"`,
  html: wrap(`
    ${h1('New Feedback Received! 📝')}
    ${p(`Hello ${data.ownerName},`)}
    ${p(`<strong>${data.reviewerName}</strong> has submitted feedback for your project.`)}
    ${card([
      ['Project',  data.projectTitle],
      ['Reviewer', data.reviewerName],
      ...(data.reviewerTier ? [['Tier', data.reviewerTier]] : [])
    ])}
    ${data.feedbackPreview
      ? h3('Preview') + quote(data.feedbackPreview)
      : ''}
    ${box('Your review includes:', [
      'Structured analysis across key categories',
      'Prioritized recommendations (critical → nice-to-have)',
      'Actionable next steps from the reviewer'
    ])}
    ${p("View the full feedback now and rate the reviewer's contribution.")}
    ${btn('View Feedback', `${B.app}/feedback`)}
    ${sign()}
  `)
}),

// ──────────────────────────────────────────
// 9. RATING RECEIVED — notifies REVIEWER
// data: { reviewerName, projectTitle, rating, xpAwarded }
// ──────────────────────────────────────────
ratingReceived: (data) => ({
  subject: `You Earned ${data.xpAwarded} XP for "${data.projectTitle}"!`,
  html: wrap(`
    ${h1('You Received a Rating! ⭐')}
    ${p(`Hello ${data.reviewerName}, your feedback has been rated.`)}
    ${card([
      ['Project',   data.projectTitle],
      ['Rating',    '⭐'.repeat(data.rating)],
      ['XP Earned', `+${data.xpAwarded} XP`]
    ])}
    ${box('Great work!',
      `Your rating of <strong>${data.rating}/5</strong> shows the value you're providing. Keep delivering quality feedback to earn more XP and climb the rankings.`,
      'success'
    )}
    ${p('Keep providing valuable feedback to earn more XP and improve your reputation.')}
    ${btn('View Profile', `${B.app}/profile`)}
    ${sign()}
  `)
})

};

// ============================================
// SEND ENGINE — syntax-fixed
// ============================================
async function sendEmail(templateName, to, data) {
  try {
    if (!templateName || !emailTemplates[templateName]) {
      throw new Error(`Email template "${templateName}" not found`);
    }
    if (!to) {
      throw new Error('Recipient email address is required');
    }
    if (!data) {
      throw new Error('Template data is required');
    }

    const template = emailTemplates[templateName](data);

    if (!template.subject || !template.html) {
      throw new Error(`Template "${templateName}" did not return valid subject/html`);
    }

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to:   to,
      subject: template.subject,
      html:    template.html
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
// EXPORTS — same signatures as before.
// New optional fields are pulled from objects
// you already pass; nothing breaks if absent.
// ============================================

export const sendOTPEmail = (email, code, name) => {
  if (!email || !code) {
    console.error('Missing required parameters for OTP email');
    return { success: false, error: 'Missing email or code' };
  }
  return sendEmail('otpVerification', email, { code, name });
};

export const sendWelcomeEmail = (user, role) => {
  if (!user?.email || !user?.name || !role) {
    console.error('Missing required parameters for welcome email');
    return { success: false, error: 'Missing user data or role' };
  }
  return sendEmail(
    role === 'reviewer' ? 'welcomeReviewer' : 'welcomeOwner',
    user.email,
    { name: user.name, tier: user.tier }          // tier used only if reviewer
  );
};

export const sendApplicationReceivedEmail = (ownerEmail, data) => {
  if (!ownerEmail || !data?.reviewerName || !data?.projectTitle || !data?.ownerName) {
    console.error('Missing required parameters for application received email');
    return { success: false, error: 'Missing required application data' };
  }
  return sendEmail('applicationReceived', ownerEmail, data);
  // accepts: projectDescription, reviewerMessage (both optional)
};

export const sendApplicationApprovedEmail = (reviewerEmail, data) => {
  if (!reviewerEmail || !data?.reviewerName || !data?.projectTitle) {
    console.error('Missing required parameters for application approved email');
    return { success: false, error: 'Missing required approval data' };
  }
  return sendEmail('applicationApproved', reviewerEmail, data);
  // accepts: projectDescription, projectType, deadline (all optional)
};

export const sendApplicationRejectedEmail = (reviewerEmail, data) => {
  if (!reviewerEmail || !data?.reviewerName || !data?.projectTitle) {
    console.error('Missing required parameters for application rejected email');
    return { success: false, error: 'Missing required rejection data' };
  }
  return sendEmail('applicationRejected', reviewerEmail, data);
};

export const sendProjectSubmittedEmail = (project) => {
  if (!project?.ownerEmail || !project?.ownerName || !project?.title) {
    console.error('Missing required parameters for project submitted email');
    return { success: false, error: 'Missing required project data' };
  }
  return sendEmail('projectSubmitted', project.ownerEmail, {
    ownerName:          project.ownerName,
    projectTitle:       project.title,
    projectDescription: project.description,    // new — already on your project object
    projectType:        project.type,           // new
    reviewerCount:      project.reviewerCount,  // new
    deadline:           project.deadline         // new
  });
};

export const sendReviewCompleteEmail = (project, feedback, reviewer) => {
  if (!project?.ownerEmail || !project?.ownerName || !project?.title || !reviewer?.username) {
    console.error('Missing required parameters for review complete email');
    return { success: false, error: 'Missing required review data' };
  }
  return sendEmail('reviewComplete', project.ownerEmail, {
    ownerName:       project.ownerName,
    reviewerName:    reviewer.username,
    projectTitle:    project.title,
    reviewerTier:    reviewer.tier,             // new
    feedbackPreview: feedback?.preview          // new — short preview string
  });
};

export const sendRatingReceivedEmail = (reviewer, feedback, project) => {
  if (!reviewer?.email || !reviewer?.username || !project?.title ||
      feedback?.ownerRating === undefined || feedback?.xpAwarded === undefined) {
    console.error('Missing required parameters for rating received email');
    return { success: false, error: 'Missing required rating data' };
  }
  return sendEmail('ratingReceived', reviewer.email, {
    reviewerName: reviewer.username,
    projectTitle: project.title,
    rating:       feedback.ownerRating,
    xpAwarded:    feedback.xpAwarded
  });
};