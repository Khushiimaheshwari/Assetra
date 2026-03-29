import { connectDB } from "../app/api/utils/db";
import Notification from "../models/Notification";
import mongoose from "mongoose";

export async function listNotificationsForUser(
  userId,
  { limit = 50, unreadOnly = false, type } = {}
) {
  await connectDB();
  const uid =
    typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

  const query = { userId: uid };
  if (unreadOnly) query.isRead = false;
  if (type === "maintenance" || type === "issue") query.type = type;

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(limit) || 50, 200))
    .lean();

  return notifications;
}

export async function getUnreadNotificationsForUser(userId, { limit = 50 } = {}) {
  await connectDB();
  const uid =
    typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

  const notifications = await Notification.find({
    userId: uid,
    isRead: false,
  })
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(limit) || 50, 200))
    .lean();

  return notifications;
}

export async function countUnreadNotificationsForUser(userId) {
  await connectDB();
  const uid =
    typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

  return Notification.countDocuments({ userId: uid, isRead: false });
}

export async function markNotificationsAsRead(userId, notificationIds) {
  await connectDB();
  const uid =
    typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

  if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
    return { modifiedCount: 0 };
  }

  const ids = notificationIds.map((id) =>
    typeof id === "string" ? new mongoose.Types.ObjectId(id) : id
  );

  const result = await Notification.updateMany(
    { _id: { $in: ids }, userId: uid },
    { $set: { isRead: true } }
  );

  return { modifiedCount: result.modifiedCount ?? 0 };
}

export async function markAllNotificationsReadForUser(userId) {
  await connectDB();
  const uid =
    typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

  const result = await Notification.updateMany(
    { userId: uid, isRead: false },
    { $set: { isRead: true } }
  );

  return { modifiedCount: result.modifiedCount ?? 0 };
}
