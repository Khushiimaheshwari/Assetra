import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { User } from "../../../../models/User";
import {
  getUnreadNotificationsForUser,
  countUnreadNotificationsForUser,
  markNotificationsAsRead,
  markAllNotificationsReadForUser,
} from "../../../../controllers/notificationController";

async function requireAdmin(session) {
  if (!session?.user?.email || session.user.role !== "admin") {
    return null;
  }
  const user = await User.findOne({ Email: session.user.email }).select("_id Role");
  if (!user || user.Role !== "admin") return null;
  return user;
}

/**
 * GET — unread in-app notifications for the logged-in admin (bell icon).
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    const admin = await requireAdmin(session);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit");

    const notifications = await getUnreadNotificationsForUser(admin._id.toString(), {
      limit: limit ? Number(limit) : 50,
    });

    const unreadCount = await countUnreadNotificationsForUser(admin._id.toString());

    return NextResponse.json(
      {
        notifications,
        unreadCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/admin/notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * PATCH — mark notification(s) as read.
 * Body: { notificationIds?: string[], markAllRead?: boolean }
 */
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    const admin = await requireAdmin(session);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { notificationIds, markAllRead } = body;

    if (markAllRead === true) {
      const result = await markAllNotificationsReadForUser(admin._id.toString());
      return NextResponse.json(result, { status: 200 });
    }

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json(
        { error: "Provide notificationIds (array) or markAllRead: true" },
        { status: 400 }
      );
    }

    const result = await markNotificationsAsRead(admin._id.toString(), notificationIds);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/admin/notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
