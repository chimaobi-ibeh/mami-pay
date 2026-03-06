const nodemailer = require('nodemailer');

// Configure your SMTP provider via environment variables:
//   EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM
// Works with Gmail, Resend (smtp.resend.com), Mailgun, etc.
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const FROM = process.env.EMAIL_FROM || `"Mami Pay" <no-reply@mamipay.com>`;
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

const sendVerificationEmail = async (email, firstName, token) => {
  const link = `${APP_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Verify your Mami Pay account',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#075f47">Welcome to Mami Pay, ${firstName}!</h2>
        <p>Click the button below to verify your email address.</p>
        <a href="${link}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#075f47;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
          Verify Email
        </a>
        <p style="color:#6b7280;font-size:12px">This link expires in 24 hours. If you did not create an account, ignore this email.</p>
      </div>`,
  });
};

const sendPasswordResetEmail = async (email, firstName, token) => {
  const link = `${APP_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Reset your Mami Pay password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#075f47">Password Reset</h2>
        <p>Hi ${firstName}, click the button below to reset your password.</p>
        <a href="${link}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#075f47;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
          Reset Password
        </a>
        <p style="color:#6b7280;font-size:12px">This link expires in 1 hour. If you did not request a password reset, ignore this email.</p>
      </div>`,
  });
};

const sendTransferNotification = async ({ senderEmail, senderName, receiverEmail, receiverName, amount }) => {
  const fmt = (n) => `₦${parseFloat(n).toLocaleString()}`;

  await Promise.allSettled([
    transporter.sendMail({
      from: FROM,
      to: senderEmail,
      subject: `Debit Alert: ${fmt(amount)} sent`,
      html: `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#dc2626">Debit Alert</h2>
        <p>Hi ${senderName}, you sent <strong>${fmt(amount)}</strong> to <strong>${receiverName}</strong>.</p>
        <p style="color:#6b7280;font-size:12px">If you did not initiate this transfer, contact support immediately.</p>
      </div>`,
    }),
    transporter.sendMail({
      from: FROM,
      to: receiverEmail,
      subject: `Credit Alert: ${fmt(amount)} received`,
      html: `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#075f47">Credit Alert</h2>
        <p>Hi ${receiverName}, you received <strong>${fmt(amount)}</strong> from <strong>${senderName}</strong>.</p>
      </div>`,
    }),
  ]);
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendTransferNotification };
