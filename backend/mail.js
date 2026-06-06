const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    return null;
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

async function sendUpdateNotification({ familyEmails, residentName, facilityName, content, feedUrl }) {
  const transport = getTransporter();
  if (!transport || familyEmails.length === 0) {
    console.log('[mail] Skipped (no SMTP or no recipients):', familyEmails);
    return { sent: false, reason: 'smtp_not_configured' };
  }

  const subject = `${residentName} has a new update from ${facilityName}`;
  const text = `A new update was posted for ${residentName}\n\n${content}\n\nView updates: ${feedUrl}`;
  const html = `
    <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; color: #1B1B1B;">
      <h2 style="color: #2D6A4F;">A new update for ${residentName}</h2>
      <p style="font-size: 16px; line-height: 1.6;">${content.replace(/\n/g, '<br>')}</p>
      <p><a href="${feedUrl}" style="display: inline-block; background: #2D6A4F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View family feed</a></p>
      <p style="color: #666; font-size: 14px;">— ${facilityName} via Kiness</p>
    </div>
  `;

  await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: familyEmails.join(', '),
    subject,
    text,
    html,
  });

  return { sent: true };
}

module.exports = { sendUpdateNotification };
