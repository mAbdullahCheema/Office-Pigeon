import nodemailer from 'nodemailer';

interface HandoffEmailInput {
  name?: string | null;
  businessName?: string | null;
  email?: string | null;
  phone?: string | null;
  needHelpWith?: string | null;
  reason?: string | null;
  userQuestion?: string | null;
  conversationSummary?: string | null;
  recommendedService?: string | null;
  whatsappUrl?: string | null;
}

function buildBody(ticket: HandoffEmailInput) {
  return `A visitor needs human help.

Lead:
Name: ${ticket.name || 'Not provided'}
Business: ${ticket.businessName || 'Not provided'}
Email: ${ticket.email || 'Not provided'}
Phone: ${ticket.phone || 'Not provided'}
Need: ${ticket.needHelpWith || 'Not provided'}

Reason for handoff:
${ticket.reason || 'Not provided'}

User question:
${ticket.userQuestion || 'Not provided'}

Conversation summary:
${ticket.conversationSummary || 'Not provided'}

Recommended service:
${ticket.recommendedService || 'Not sure yet'}

WhatsApp link:
${ticket.whatsappUrl || 'Not generated'}`;
}

export async function sendHandoffNotification(ticket: HandoffEmailInput) {
  const to = process.env.OFFICE_PIGEON_EMAIL_TO;
  const from = process.env.OFFICE_PIGEON_EMAIL_FROM;
  const provider = (process.env.EMAIL_PROVIDER || '').toLowerCase();

  if (!to || !from || !provider) {
    console.warn('[Pip AI] Email is not configured; handoff ticket saved without email notification.');
    return { sent: false, reason: 'email_not_configured' };
  }

  const subject = 'New Pip AI Human Handoff — Office Pigeon';
  const text = buildBody(ticket);

  try {
    if (provider === 'resend') {
      if (!process.env.EMAIL_API_KEY) throw new Error('Missing EMAIL_API_KEY for Resend.');
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.EMAIL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ from, to, subject, text })
      });
      return { sent: true };
    }

    if (provider === 'sendgrid') {
      if (!process.env.EMAIL_API_KEY) throw new Error('Missing EMAIL_API_KEY for SendGrid.');
      await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.EMAIL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: from },
          subject,
          content: [{ type: 'text/plain', value: text }]
        })
      });
      return { sent: true };
    }

    if (provider === 'smtp') {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT || 587) === 465,
        auth: process.env.SMTP_USER
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS
            }
          : undefined
      });
      await transporter.sendMail({ from, to, subject, text });
      return { sent: true };
    }

    console.warn(`[Pip AI] Unknown EMAIL_PROVIDER "${provider}"; skipping email notification.`);
    return { sent: false, reason: 'unknown_provider' };
  } catch (error) {
    console.warn('[Pip AI] Handoff email failed; continuing without email.', error);
    return { sent: false, reason: 'send_failed' };
  }
}
