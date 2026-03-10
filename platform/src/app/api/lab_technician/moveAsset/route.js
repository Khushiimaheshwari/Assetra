import { NextResponse } from "next/server";
import { connectDB } from "../../utils/db";
import Assets from "../../../../models/Lab_Technician";
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

    if (!assetId || !To_Lab) {
      return NextResponse.json(
        { error: "assetId and To_Lab are required." },
        { status: 400 }
      );
    }

    // ── Fetch asset ───────────────────────────────────────────────────────
    const asset = await Assets.findById(assetId);
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // Prevent moving to the same lab+PC combination
    const sameDestination =
      asset.Lab_Name?.toString() === To_Lab &&
      (asset.PC_Name?.toString() || null) === (To_PC || null);

    if (sameDestination) {
      return NextResponse.json(
        { error: "Asset is already in the selected destination." },
        { status: 400 }
      );
    }

    const movementEntry = {
      From_Lab: asset.Lab_Name,        // current lab ObjectId
      To_Lab:   To_Lab,
      From_PC:  asset.PC_Name || null, // current PC ObjectId (may be null)
      To_PC:    To_PC   || null,
      Moved_By: technician._id,
      Reason:   Reason  || "",
      Date:     new Date(),
    };

    asset.Movement_History.push(movementEntry);
    asset.Lab_Name = To_Lab;
    asset.PC_Name  = To_PC || null;

    await asset.save();

    return NextResponse.json(
      { message: "Asset moved successfully.", asset },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error moving asset:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}