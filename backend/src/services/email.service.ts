import { Resend } from 'resend';
import { config } from '../config';
import { logger } from '../config/logger';

const resend = new Resend(config.resend.apiKey);
const BASE_URL = config.frontendUrl;
const btnStyle = 'display:inline-block;background:#6366f1;color:white;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:600;text-decoration:none;';

function emailTemplate(title: string, body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title></head><body style="font-family:system-ui,sans-serif;background:#f5f5f5;padding:40px 0;"><div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;"><div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center;"><h1 style="color:white;margin:0;">AI Proposal Generator</h1></div><div style="padding:40px;">${body}</div></div></body></html>`;
}

export const emailService = {
  async sendVerification(email: string, name: string, token: string): Promise<void> {
    await resend.emails.send({
      from: config.resend.fromEmail, to: email,
      subject: 'Verify your AI Proposal Generator account',
      html: emailTemplate('Verify Your Email', `<p>Hi ${name},</p><p>Verify your email to get started.</p><div style="text-align:center;margin:32px 0;"><a href="${BASE_URL}/verify-email?token=${token}" style="${btnStyle}">Verify Email</a></div>`),
    });
    logger.info('Verification email sent', { email });
  },
  async sendPasswordReset(email: string, name: string, token: string): Promise<void> {
    await resend.emails.send({
      from: config.resend.fromEmail, to: email,
      subject: 'Reset your password',
      html: emailTemplate('Reset Password', `<p>Hi ${name},</p><p>Click below to reset your password.</p><div style="text-align:center;margin:32px 0;"><a href="${BASE_URL}/reset-password?token=${token}" style="${btnStyle}">Reset Password</a></div>`),
    });
  },
  async sendProposalApproved(ownerEmail: string, ownerName: string, proposalTitle: string, clientName: string): Promise<void> {
    await resend.emails.send({
      from: config.resend.fromEmail, to: ownerEmail,
      subject: `Proposal approved: ${proposalTitle}`,
      html: emailTemplate('Proposal Approved!', `<p>Hi ${ownerName},</p><p>${clientName} approved: <strong>${proposalTitle}</strong>.</p><div style="text-align:center;margin:32px 0;"><a href="${BASE_URL}/dashboard" style="${btnStyle}">View Dashboard</a></div>`),
    });
  },
};
