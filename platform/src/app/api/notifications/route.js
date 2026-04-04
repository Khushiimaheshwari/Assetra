import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import { User } from "../../../models/User";
import {
  listNotificationsForUser,
  countUnreadNotificationsForUser,
  markNotificationsAsRead,
  markAllNotificationsReadForUser,
} from "../../../controllers/notificationController";

async function requireSessionUser(session) {
  if (!session?.user?.email) return null;
  const user = await User.findOne({ Email: session.user.email }).select("_id Role");
  return user || null;
}

/**
 * GET — notifications for the logged-in user (any role).
 * Query: unreadOnly=true|false, type=maintenance|issue, limit=n
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    const user = await requireSessionUser(session);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit");
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const type = searchParams.get("type");

    const notifications = await listNotificationsForUser(user._id.toString(), {
      limit: limit ? Number(limit) : 50,
      unreadOnly,
      type: type || undefined,
    });

    const unreadCount = await countUnreadNotificationsForUser(user._id.toString());

    return NextResponse.json({ notifications, unreadCount }, { status: 200 });
  } catch (error) {
    console.error("GET /api/notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * PATCH — mark notification(s) as read for the logged-in user.
 * Body: { notificationIds?: string[], markAllRead?: boolean }
 */
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    const user = await requireSessionUser(session);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { notificationIds, markAllRead } = body;

    if (markAllRead === true) {
      const result = await markAllNotificationsReadForUser(user._id.toString());
      return NextResponse.json(result, { status: 200 });
    }

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json(
        { error: "Provide notificationIds (array) or markAllRead: true" },
        { status: 400 }
      );
    }

    const result = await markNotificationsAsRead(user._id.toString(), notificationIds);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
