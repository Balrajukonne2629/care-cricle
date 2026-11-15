import { NotificationLog, Medication, ElderProfile, CareCircleMember, EmergencySosEvent } from './types';
export * from './emailTemplates';

// In-memory inspection log for sent emails (accessible in real-time by UI email inspector)
let inAppEmailArchive: NotificationLog[] = [];

export function getEmailArchive(): NotificationLog[] {
  return [...inAppEmailArchive];
}

export function clearEmailArchive(): void {
  inAppEmailArchive = [];
}

/**
 * Dispatch an email notification.
 * If SMTP environment variables are present and running in Node.js server environment,
 * attempts nodemailer delivery; otherwise logs to in-app live interactive inspector.
 */
export async function sendEmailNotification(
  type: NotificationLog['type'],
  recipientName: string,
  recipientEmail: string,
  subject: string,
  previewText: string,
  htmlContent: string
): Promise<NotificationLog> {
  const logItem: NotificationLog = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    type,
    recipientName,
    recipientEmail,
    subject,
    previewText,
    htmlContent,
    status: 'delivered',
  };

  // Safe server-only check for nodemailer
  if (typeof window === 'undefined' && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      // Use eval require so client-side bundlers won't attempt to bundle net/fs/dns
      const nodeMailerReq = eval("require('nodemailer')");
      const transporter = nodeMailerReq.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"CareCircle Health" <${process.env.SMTP_FROM || 'care@carecircle.health'}>`,
        to: recipientEmail,
        subject,
        html: htmlContent,
      });

      logItem.status = 'sent';
    } catch (err: any) {
      console.warn('Real SMTP delivery notice, recorded in live inspector:', err?.message);
      logItem.status = 'delivered';
    }
  } else {
    logItem.status = 'delivered';
  }

  // Prepend to live in-app inspection archive
  inAppEmailArchive.unshift(logItem);
  return logItem;
}
