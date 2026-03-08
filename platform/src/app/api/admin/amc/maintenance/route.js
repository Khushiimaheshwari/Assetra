// app/api/admin/amc/maintenance/route.js
import { NextResponse } from "next/server";
import { connectDB } from "../../../utils/db";
import AMCMaintenance from "../../../../../models/AMC_Maintenance";
import Assets from "../../../../../models/Asset";

// ── GET all maintenance records ───────────────────────────────────────────────
export async function GET() {
  try {
    await connectDB();

    const records = await AMCMaintenance.find()
      .populate("Asset", "Asset_Name Asset_Type Brand Lab_Name PC_Name")
      .populate({
        path: "Asset",
        populate: [
          { path: "Lab_Name", select: "Lab_ID Lab_Name" },
          { path: "PC_Name",  select: "PC_Name" },
        ],
      })
      .populate("Technician", "Name")
      .sort({ Scheduled_Date: -1 })
      .lean();

    const maintenance = records.map((r) => {
      const asset = r.Asset || {};
      const labId =
        asset.Lab_Name?.Lab_ID ||
        asset.Lab_Name?._id?.toString()?.slice(-4) ||
        "???";
      const pcName = asset.PC_Name?.PC_Name || "";
      const assetId = pcName
        ? `${labId}-${pcName}`
        : `${labId}-${asset._id?.toString().slice(-4).toUpperCase() || "??"}`;

      return {
        _id: r._id,
        assetId,
        assetName: r.Asset_Name || asset.Asset_Name || "Unknown",
        assetType: r.Asset_Type || asset.Asset_Type || "—",
        scheduledDate: r.Scheduled_Date
          ? new Date(r.Scheduled_Date).toISOString().slice(0, 10)
          : null,
        completedDate: r.Completed_Date
          ? new Date(r.Completed_Date).toISOString().slice(0, 10)
          : null,
        technicianName:
          r.Technician_Name ||
          r.Technician?.Name ||
          "Unassigned",
        workDone: r.Work_Done || "",
        cost: r.Cost ?? 0,
        status: r.Status,
        notes: r.Notes || "",
        createdAt: r.createdAt,
      };
    });

    return NextResponse.json({ maintenance }, { status: 200 });
  } catch (error) {
    console.error("Error fetching maintenance records:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ── POST — schedule a new maintenance record ──────────────────────────────────
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      assetObjectId,   // MongoDB _id of the asset
      scheduledDate,
      technicianId,    // optional ObjectId of LabTechnician
      technicianName,
      workDone,
      cost,
      status,
      notes,
    } = body;

    if (!assetObjectId || !scheduledDate) {
      return NextResponse.json(
        { error: "assetObjectId and scheduledDate are required" },
        { status: 400 }
      );
    }

    // Fetch asset to denormalise name/type
    const asset = await Assets.findById(assetObjectId)
      .populate("Lab_Name", "Lab_ID Lab_Name")
      .lean();

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const record = await AMCMaintenance.create({
      Asset: assetObjectId,
      Asset_Name: asset.Asset_Name,
      Asset_Type: asset.Asset_Type,
      Lab_Name: asset.Lab_Name?._id || asset.Lab_Name,
      Scheduled_Date: new Date(scheduledDate),
      Technician: technicianId || undefined,
      Technician_Name: technicianName || "",
      Work_Done: workDone || "",
      Cost: cost ? Number(cost) : 0,
      Status: status || "Scheduled",
      Notes: notes || "",
    });

    return NextResponse.json({ maintenance: record }, { status: 201 });
  } catch (error) {
    console.error("Error creating maintenance record:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}