import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/authOptions";
import { connectDB } from "../../../../utils/db";
import AMCMaintenance from "../../../../../../models/AMC_Maintenance";
import { User } from "../../../../../../models/User";
import appEventEmitter, {
  MAINTENANCE_EVENTS,
} from "../../../../../../events/appEventEmitter";
import { registerMaintenanceListeners } from "../../../../../../events/maintenanceEventListener";

async function requireAdmin(session) {
  if (!session?.user?.email || session.user.role !== "admin") {
    return null;
  }
  const user = await User.findOne({ Email: session.user.email }).select("_id Role");
  if (!user || user.Role !== "admin") return null;
  return user;
}

/**
 * PATCH — update maintenance (status changes emit MAINTENANCE_STATUS_CHANGED).
 */
export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const admin = await requireAdmin(session);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    registerMaintenanceListeners();

    const { id } = await params;
    const body = await req.json();
    const { status, completedDate, workDone, cost, notes, serviceOfficerName } = body;

    const existing = await AMCMaintenance.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Maintenance record not found" }, { status: 404 });
    }

    const previousStatus = existing.Status;

    if (status !== undefined) existing.Status = status;
    if (completedDate !== undefined) existing.Completed_Date = completedDate ? new Date(completedDate) : null;
    if (workDone !== undefined) existing.Work_Done = workDone;
    if (cost !== undefined) existing.Cost = Number(cost) || 0;
    if (notes !== undefined) existing.Notes = notes;
    if (serviceOfficerName !== undefined) existing.Service_Officer_Name = serviceOfficerName;

    await existing.save();

    if (previousStatus !== existing.Status) {
      appEventEmitter.emit(MAINTENANCE_EVENTS.STATUS_CHANGED, {
        maintenanceId: existing._id.toString(),
        assetName: existing.Asset_Name,
        previousStatus,
        newStatus: existing.Status,
      });
    }

    return NextResponse.json({ maintenance: existing }, { status: 200 });
  } catch (error) {
    console.error("PATCH maintenance:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
