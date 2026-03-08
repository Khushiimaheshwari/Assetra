import { NextResponse } from "next/server";
import { connectDB } from "../../utils/db";
import mongoose from "mongoose";
import Lab from "../../../../models/Labs";
import NonTechAssets from "../../../../models/NonTechAssets";
import { generateQRCodeForNonTechAsset } from "../../utils/nonTechgenerateQR";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    console.log(body);

    const {
      Asset_Name,
      Assest_Status,
      Lab: LabId,
      Financial_Details
    } = body;

    if (!Asset_Name || !Assest_Status || !LabId) {
      return NextResponse.json(
        { error: "Asset Name, Status and Lab are required" },
        { status: 400 }
      );
    }

    if (!["Yes", "No", "Other"].includes(Assest_Status)) {
      return NextResponse.json(
        { error: "Invalid Asset Status" },
        { status: 400 }
      );
    }

    const newAsset = await NonTechAssets.create({
      Asset_Name,
      Assest_Status,
      Lab_Name: new mongoose.Types.ObjectId(LabId),
      QR_Code: "",
      Financial_Details,
    });

    await Lab.findByIdAndUpdate(LabId, {
      $push: { NonTechAssets: newAsset._id },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    console.log("Generating QR for:", newAsset._id);

    await generateQRCodeForNonTechAsset(newAsset._id, baseUrl);

    const aiResponse = await fetch(
      `${baseUrl}/api/ai/predict`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId: newAsset._id }),
      }
    );

    const aiData = await aiResponse.json();

    return NextResponse.json({
      message: "Asset added successfully",
      asset: newAsset,
      AI: aiData,
    });

  } catch (error) {
    console.log(error);
    console.error("Error adding Asset:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}