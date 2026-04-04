import nodemailer from "nodemailer";
import { connectDB } from "../app/api/utils/db";
import Notification from "../models/Notification";

let transporter;
let smtpMissingLogged = false;

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
 * @param {object} [links] - Optional deep links: { labId, pcId, hardwareAssetId, maintenanceId }
 *   pcId = PCs collection id for /lab/.../asset/[pcId] routes; hardwareAssetId stored for reference only.
 */
export async function sendInAppNotification(userId, title, message, type, links = {}) {
  await connectDB();
  const { labId, pcId, hardwareAssetId, maintenanceId } = links;
  const doc = await Notification.create({
    userId,
    title,
    message,
    type,
    isRead: false,
    createdAt: new Date(),
    linkLabId: labId ?? null,
    linkPcId: pcId ?? null,
    linkAssetId: hardwareAssetId ?? null,
    linkMaintenanceId: maintenanceId ?? null,
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
    if (!smtpMissingLogged) {
      smtpMissingLogged = true;
      console.warn(
        "[notificationService] Email disabled: set SMTP_HOST, SMTP_USER, SMTP_PASS (if required), and SMTP_FROM in .env — see env.example in the platform folder"
      );
    }
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
export async function notifyUserInAppAndEmail(userId, email, title, message, type, links) {
  const tasks = [sendInAppNotification(userId, title, message, type, links)];
  if (email) {
    tasks.push(sendEmailNotification(email, `[Assetra] ${title}`, message));
  }
  return Promise.allSettled(tasks);
}
