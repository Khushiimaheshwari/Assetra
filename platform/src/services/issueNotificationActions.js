import { User } from "../models/User";
import { notifyUserInAppAndEmail } from "./notificationService";

const ISSUE = "issue";

async function emailForUser(userId) {
  if (!userId) return null;
  const u = await User.findById(userId).select("Email").lean();
  return u?.Email ?? null;
}

export async function onIssueCreated(payload) {
  const {
    labTechnicianUserId,
    assetName,
    issueDescription,
    issueId,
    assetId,
  } = payload;

  if (!labTechnicianUserId) return;

  const email = await emailForUser(labTechnicianUserId);
  const title = "New issue reported in your lab";
  const message = [
    "A faculty member reported an issue that is assigned to you.",
    `Asset: ${assetName || "Unknown"}`,
    `Description: ${issueDescription || "—"}`,
    `Issue ID: ${issueId}`,
    `Asset ID: ${assetId}`,
  ].join("\n");

  await notifyUserInAppAndEmail(
    labTechnicianUserId,
    email,
    title,
    message,
    ISSUE
  );
}

export async function onIssuePendingToResolved(payload) {
  const {
    facultyUserId,
    assetName,
    resolveDescription,
    issueId,
    assetId,
  } = payload;

  if (!facultyUserId) return;

  const email = await emailForUser(facultyUserId);
  const title = "Your reported issue was resolved";
  const message = [
    "The lab technician marked your issue as resolved. Please review and approve if satisfied.",
    `Asset: ${assetName || "Unknown"}`,
    `Resolution: ${resolveDescription || "—"}`,
    `Issue ID: ${issueId}`,
    `Asset ID: ${assetId}`,
  ].join("\n");

  await notifyUserInAppAndEmail(facultyUserId, email, title, message, ISSUE);
}

export async function onIssueResolvedToApproved(payload) {
  const { labTechnicianUserId, assetName, issueId, assetId } = payload;

  if (!labTechnicianUserId) return;

  const email = await emailForUser(labTechnicianUserId);
  const title = "Issue approved by faculty";
  const message = [
    "The faculty member approved the resolution for an issue you handled.",
    `Asset: ${assetName || "Unknown"}`,
    `Issue ID: ${issueId}`,
    `Asset ID: ${assetId}`,
  ].join("\n");

  await notifyUserInAppAndEmail(
    labTechnicianUserId,
    email,
    title,
    message,
    ISSUE
  );
}
