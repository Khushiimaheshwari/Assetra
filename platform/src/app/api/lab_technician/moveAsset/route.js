import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "../../utils/db";
import Assets from "../../../../models/Asset";
import PCs from "../../../../models/Lab_PCs";
import Lab from "../../../../models/Labs";
import LabTechnician from "../../../../models/Lab_Technician";
import { User } from "../../../../models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

export async function POST(req) {
  try {
    await connectDB();

    // ── Auth ──────────────────────────────────────────────────────────────
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "lab_technician") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── Resolve logged-in technician ──────────────────────────────────────
    const user = await User.findOne({ Email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const technician = await LabTechnician.findOne({ UserDetails: user._id });
    if (!technician) {
      return NextResponse.json({ error: "Technician not found" }, { status: 404 });
    }

    // ── Validate body ─────────────────────────────────────────────────────
    const { assetId, To_Lab, To_PC, Reason } = await req.json();

    if (!assetId || !To_Lab || !To_PC) {
      return NextResponse.json(
        { error: "assetId, To_Lab and To_PC are required." },
        { status: 400 }
      );
    }

    // ── Fetch asset ───────────────────────────────────────────────────────
    const asset = await Assets.findById(assetId);
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const toLabId = new mongoose.Types.ObjectId(To_Lab);
    const toPCId = new mongoose.Types.ObjectId(To_PC);

    // Technician can only move assets across labs assigned to them.
    const allowedLabIds = new Set((technician.Labs || []).map((labId) => String(labId)));
    if (!allowedLabIds.has(String(asset.Lab_Name)) || !allowedLabIds.has(String(toLabId))) {
      return NextResponse.json(
        { error: "You can only move assets within labs assigned to you." },
        { status: 403 }
      );
    }

    // Prevent moving to the same lab+PC combination
    const sameDestination =
      asset.Lab_Name?.toString() === String(toLabId) &&
      (asset.PC_Name?.toString() || null) === String(toPCId);

    if (sameDestination) {
      return NextResponse.json(
        { error: "Asset is already in the selected destination." },
        { status: 400 }
      );
    }

    const destinationLab = await Lab.findById(toLabId).select("_id Lab_Type").lean();
    if (!destinationLab || destinationLab.Lab_Type !== "Technical_Lab") {
      return NextResponse.json(
        { error: "Destination lab must be a valid technical lab." },
        { status: 400 }
      );
    }

    const destinationPC = await PCs.findById(toPCId).select("_id Lab_Name").lean();
    if (!destinationPC || String(destinationPC.Lab_Name) !== String(toLabId)) {
      return NextResponse.json(
        { error: "Selected destination PC does not belong to destination lab." },
        { status: 400 }
      );
    }

    const fromPCId = asset.PC_Name || null;

    const movementEntry = {
      From_Lab: asset.Lab_Name,        // current lab ObjectId
      To_Lab:   toLabId,
      From_PC:  fromPCId, // current PC ObjectId (may be null)
      To_PC:    toPCId,
      Moved_By: user._id,
      Reason:   Reason  || "",
      Date:     new Date(),
    };

    asset.Movement_History.push(movementEntry);
    asset.Lab_Name = toLabId;
    asset.PC_Name  = toPCId;

    await asset.save();

    if (fromPCId) {
      await PCs.findByIdAndUpdate(fromPCId, { $pull: { Assets: asset._id } });
    }
    await PCs.findByIdAndUpdate(toPCId, { $addToSet: { Assets: asset._id } });

    return NextResponse.json(
      { message: "Asset moved successfully.", asset },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error moving asset:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}