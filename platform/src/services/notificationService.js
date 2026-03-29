import nodemailer from "nodemailer";
import { connectDB } from "../app/api/utils/db";
import Notification from "../models/Notification";

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER) {
    return null;
  }
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
  return transporter;
}

/**
 * Persist an in-app notification (e.g. bell icon feed).
 */
export async function sendInAppNotification(userId, title, message, type) {
  await connectDB();
  const doc = await Notification.create({
    userId,
    title,
    message,
    type,
    isRead: false,
    createdAt: new Date(),
  });
  return doc;
}

/**
 * Send email via Nodemailer (no DB write).
 */
export async function sendEmailNotification(email, subject, message) {
  const tx = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!tx || !from) {
    console.warn(
      "[notificationService] Email not sent: configure SMTP_HOST, SMTP_USER, and optionally SMTP_FROM"
    );
    return { sent: false, reason: "smtp_not_configured" };
  }

  await tx.sendMail({
    from,
    to: email,
    subject,
    text: message,
    html: `<p>${message.replace(/\n/g, "<br/>")}</p>`,
  });
  return { sent: true };
}

/**
 * In-app + email for one user (bell + inbox). Email skipped if address missing.
 */
export async function notifyUserInAppAndEmail(userId, email, title, message, type) {
  const tasks = [sendInAppNotification(userId, title, message, type)];
  if (email) {
    tasks.push(sendEmailNotification(email, `[Assetra] ${title}`, message));
  }
  return Promise.allSettled(tasks);
}
