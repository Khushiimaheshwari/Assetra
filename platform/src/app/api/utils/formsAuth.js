import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import { User } from "../../../models/User";
import { connectDB } from "./db";

export async function getSessionStaff() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  await connectDB();
  const user = await User.findOne({ Email: session.user.email })
    .select("_id Role Name Email")
    .lean();
  if (!user) {
    return { error: NextResponse.json({ error: "User not found" }, { status: 404 }) };
  }
  if (user.Role !== "admin" && user.Role !== "lab_technician") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user, session };
}

export async function requireAdmin() {
  const r = await getSessionStaff();
  if (r.error) return r;
  if (r.user.Role !== "admin") {
    return { error: NextResponse.json({ error: "Admin only" }, { status: 403 }) };
  }
  return r;
}

export async function requireLabTechnician() {
  const r = await getSessionStaff();
  if (r.error) return r;
  if (r.user.Role !== "lab_technician") {
    return { error: NextResponse.json({ error: "Lab technician only" }, { status: 403 }) };
  }
  return r;
}
