import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { connectDB } from "../../utils/db";
import { User } from "../../../../models/User";
import Lab from "../../../../models/Labs";
import NonTechAssets from "../../../../models/NonTechAssets";

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

    const user = await User.findOne({ Email: session.user.email }).select("_id").lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { assetId, To_Lab, Reason } = await req.json();
    if (!assetId || !To_Lab) {
      return NextResponse.json(
        { error: "assetId and To_Lab are required." },
        { status: 400 }
      );
    }

    const asset = await NonTechAssets.findById(assetId);
    if (!asset) {
      return NextResponse.json({ error: "Asset not found." }, { status: 404 });
    }

    const toLabId = new mongoose.Types.ObjectId(To_Lab);
    const fromLabId = asset.Lab_Name;
    if (String(fromLabId) === String(toLabId)) {
      return NextResponse.json(
        { error: "Asset is already in the selected destination lab." },
        { status: 400 }
      );
    }

    const destinationLab = await Lab.findById(toLabId).select("_id Lab_Type").lean();
    if (!destinationLab) {
      return NextResponse.json({ error: "Destination lab not found." }, { status: 404 });
    }
    if (destinationLab.Lab_Type !== "Non_Technical_Lab") {
      return NextResponse.json(
        { error: "Non-technical assets can only be moved to non-technical labs." },
        { status: 400 }
      );
    }

    asset.Movement_History.push({
      From_Lab: fromLabId,
      To_Lab: toLabId,
      Moved_By: user._id,
      Reason: Reason || "",
      Date: new Date(),
    });
    asset.Lab_Name = toLabId;
    await asset.save();

    await Lab.findByIdAndUpdate(fromLabId, { $pull: { NonTechAssets: asset._id } });
    await Lab.findByIdAndUpdate(toLabId, { $addToSet: { NonTechAssets: asset._id } });

    return NextResponse.json(
      { message: "Non-technical asset moved successfully.", asset },
      { status: 200 }
    );
  } catch (error) {
    console.error("moveNonTechAsset error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
