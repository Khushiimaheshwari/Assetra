import mongoose from "mongoose";
import { connectDB } from "../app/api/utils/db";
import Assets from "../models/Asset";
import Faculty from "../models/Faculty";
import LabTechnician from "../models/Lab_Technician";
import { User } from "../models/User";
import { notifyUserInAppAndEmail } from "./notificationService";

const ISSUE = "issue";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function referenceDate(issue) {
  if (issue.Reported_At) return new Date(issue.Reported_At);
  if (issue._id) {
    try {
      return new mongoose.Types.ObjectId(issue._id).getTimestamp();
    } catch {
      return new Date();
    }
  }
  return new Date();
}

async function emailForUser(userId) {
  if (!userId) return null;
  const u = await User.findById(userId).select("Email").lean();
  return u?.Email ?? null;
}

/**
 * Pending issues older than 7 days: notify faculty, assigned technician, and all admins.
 * Repeats at most once per week per issue until status changes from pending.
 */
async function notifyOverdueForIssue(asset, issue) {
  const title = "Overdue issue reminder (still pending)";
  const ref = referenceDate(issue);
  const message = [
    "This issue has been pending for more than 7 days.",
    `Asset: ${asset.Asset_Name || "Unknown"}`,
    `Description: ${issue.IssueDescription || "—"}`,
    `First reported: ${ref.toISOString().slice(0, 10)}`,
    `Issue ID: ${issue._id}`,
    `Asset ID: ${asset._id}`,
  ].join("\n");

  const faculty = await Faculty.findById(issue.FacultyDetails)
    .select("UserDetails")
    .lean();
  const facultyUserId = faculty?.UserDetails;

  let techUserId = null;
  if (issue.Assigned_To) {
    const tech = await LabTechnician.findById(issue.Assigned_To)
      .select("UserDetails")
      .lean();
    techUserId = tech?.UserDetails ?? null;
  }

  const admins = await User.find({ Role: "admin" }).select("_id Email").lean();

  const targets = [];
  if (facultyUserId) {
    targets.push({ userId: facultyUserId, email: null });
  }
  if (techUserId) {
    targets.push({ userId: techUserId, email: null });
  }
  for (const a of admins) {
    targets.push({ userId: a._id, email: a.Email });
  }

  const seen = new Set();
  for (const t of targets) {
    const id = t.userId?.toString();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const email = t.email ?? (await emailForUser(t.userId));
    await notifyUserInAppAndEmail(t.userId, email, title, message, ISSUE, {
      labId: asset.Lab_Name,
      pcId: asset.PC_Name,
      hardwareAssetId: asset._id,
    });
  }
}

function shouldSendOverdueNow(issue, nowMs) {
  if (issue.Status !== "pending") return false;

  const ref = referenceDate(issue);
  if (nowMs - ref.getTime() < WEEK_MS) return false;

  const last = issue.Last_Overdue_Notification_At
    ? new Date(issue.Last_Overdue_Notification_At).getTime()
    : null;

  if (last == null) return true;
  return nowMs - last >= WEEK_MS;
}

export async function runOverdueIssueCheck() {
  await connectDB();

  const assets = await Assets.find({
    "Issue_Reported.Status": "pending",
  }).lean();

  const nowMs = Date.now();

  for (const asset of assets) {
    for (const issue of asset.Issue_Reported || []) {
      if (!shouldSendOverdueNow(issue, nowMs)) continue;

      try {
        await notifyOverdueForIssue(asset, issue);
      } catch (err) {
        console.error(
          "[issueOverdueProcessor] notify failed",
          asset._id,
          issue._id,
          err
        );
        continue;
      }

      await Assets.updateOne(
        { _id: asset._id },
        {
          $set: {
            "Issue_Reported.$[elem].Last_Overdue_Notification_At": new Date(),
          },
        },
        { arrayFilters: [{ "elem._id": issue._id }] }
      );
    }
  }
}
