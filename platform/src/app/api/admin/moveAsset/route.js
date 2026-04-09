import { NextResponse } from "next/server";
import { connectDB } from "../../utils/db";
import Assets from "../../../../models/Asset";
import PCs from "../../../../models/Lab_PCs";
import Lab from "../../../../models/Labs";
import { User } from "../../../../models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await User.findOne({ Email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { assetId, To_Lab, To_PC, Reason } = await req.json();

    if (!assetId || !To_Lab || !To_PC) {
      return NextResponse.json(
        { error: "assetId, To_Lab and To_PC are required." },
        { status: 400 }
      );
    }

    const asset = await Assets.findById(assetId);

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const toLabId = new mongoose.Types.ObjectId(To_Lab);
    const toPCId = new mongoose.Types.ObjectId(To_PC);

    const fromLabId = asset.Lab_Name;
    const fromPCId = asset.PC_Name;

    // Prevent same location movement
    const sameDestination =
      fromLabId?.toString() === toLabId.toString() &&
      (fromPCId?.toString() || null) === (toPCId?.toString() || null);

    if (sameDestination) {
      return NextResponse.json(
        { error: "Asset already exists in selected Lab/PC" },
        { status: 400 }
      );
    }

    const destinationLab = await Lab.findById(toLabId).select("_id Lab_Type PCs").lean();
    if (!destinationLab) {
      return NextResponse.json({ error: "Destination lab not found." }, { status: 404 });
    }
    if (destinationLab.Lab_Type !== "Technical_Lab") {
      return NextResponse.json(
        { error: "Technical assets can only be moved to a technical lab." },
        { status: 400 }
      );
    }

    const destinationPC = await PCs.findById(toPCId).select("_id Lab_Name").lean();
    if (!destinationPC) {
      return NextResponse.json({ error: "Destination PC not found." }, { status: 404 });
    }
    if (String(destinationPC.Lab_Name) !== String(toLabId)) {
      return NextResponse.json(
        { error: "Selected PC does not belong to the selected lab." },
        { status: 400 }
      );
    }

    // Movement history
    const movementEntry = {
      From_Lab: fromLabId,
      To_Lab: toLabId,
      From_PC: fromPCId || null,
      To_PC: toPCId,
      Moved_By: user._id,
      Reason: Reason || "",
      Date: new Date(),
    };

    asset.Movement_History.push(movementEntry);

    // Update asset location
    asset.Lab_Name = toLabId;
    asset.PC_Name = toPCId;

    await asset.save();

    // -------- REMOVE FROM OLD PC --------
    if (fromPCId) {
      await PCs.findByIdAndUpdate(fromPCId, {
        $pull: { Assets: asset._id },
      });
    }

    // -------- ADD TO NEW PC --------
    if (toPCId) {
      await PCs.findByIdAndUpdate(toPCId, {
        $addToSet: { Assets: asset._id },
      });
    }

    return NextResponse.json(
      {
        message: "Asset moved successfully",
        asset,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error moving asset:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}