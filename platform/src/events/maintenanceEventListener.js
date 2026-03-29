import { User } from "../models/User";
import { connectDB } from "../app/api/utils/db";
import appEventEmitter, { MAINTENANCE_EVENTS } from "./appEventEmitter";
import {
  sendEmailNotification,
  sendInAppNotification,
} from "../services/notificationService";

let listenersRegistered = false;

function formatDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return String(d);
  }
}

async function notifyAllAdmins({ title, message, emailSubject }) {
  await connectDB();
  const admins = await User.find({ Role: "admin" }).select("_id Email Name").lean();
  if (!admins.length) return;

  const tasks = admins.flatMap((admin) => [
    sendInAppNotification(admin._id, title, message, "maintenance"),
    sendEmailNotification(admin.Email, emailSubject, message),
  ]);

  await Promise.allSettled(tasks);
}

function onMaintenanceCreated(payload) {
  const {
    maintenanceId,
    assetName,
    scheduledDate,
    status,
    serviceOfficerName,
  } = payload;

  const title = "New maintenance scheduled";
  const message = [
    `A maintenance record was created.`,
    `Asset: ${assetName || "Unknown"}`,
    `Scheduled: ${formatDate(scheduledDate)}`,
    `Status: ${status || "Scheduled"}`,
    `Service officer: ${serviceOfficerName || "—"}`,
    `Record ID: ${maintenanceId}`,
  ].join("\n");

  const emailSubject = `[Assetra] ${title}`;

  return notifyAllAdmins({ title, message, emailSubject }).catch((err) => {
    console.error("[maintenanceEventListener] MAINTENANCE_CREATED handler error:", err);
  });
}

function onMaintenanceStatusChanged(payload) {
  const {
    maintenanceId,
    assetName,
    previousStatus,
    newStatus,
  } = payload;

  const title = "Maintenance status updated";
  const message = [
    `Maintenance status changed from "${previousStatus}" to "${newStatus}".`,
    `Asset: ${assetName || "Unknown"}`,
    `Record ID: ${maintenanceId}`,
  ].join("\n");

  const emailSubject = `[Assetra] ${title}`;

  return notifyAllAdmins({ title, message, emailSubject }).catch((err) => {
    console.error(
      "[maintenanceEventListener] MAINTENANCE_STATUS_CHANGED handler error:",
      err
    );
  });
}

/**
 * Idempotent registration for Next.js hot reload.
 */
export function registerMaintenanceListeners() {
  if (listenersRegistered) return;
  listenersRegistered = true;

  appEventEmitter.on(MAINTENANCE_EVENTS.CREATED, onMaintenanceCreated);
  appEventEmitter.on(MAINTENANCE_EVENTS.STATUS_CHANGED, onMaintenanceStatusChanged);
}
