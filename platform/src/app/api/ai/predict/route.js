import { NextResponse } from "next/server";
import { connectDB } from "../../../../app/api/utils/db";
import Assets from "../../../../models/Asset";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { assetId } = body;

    if (!assetId) {
      return NextResponse.json(
        { error: "Asset ID is required" },
        { status: 400 }
      );
    }

    const asset = await Assets.findById(assetId);

    if (!asset) {
      return NextResponse.json(
        { error: "Asset not found" },
        { status: 404 }
      );
    }

    if (!asset.Financial_Details) {
      return NextResponse.json(
        { error: "Financial details missing" },
        { status: 400 }
      );
    }

    const pythonServiceURL = process.env.PYTHON_AI_SERVICE_URL;

    if (!pythonServiceURL) {
      return NextResponse.json(
        { error: "Python service URL not configured" },
        { status: 500 }
      );
    }

    const aiResponse = await fetch(pythonServiceURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(asset.Financial_Details),
    });

    if (!aiResponse.ok) {
      return NextResponse.json(
        { error: "AI service failed" },
        { status: 500 }
      );
    }

    const AI_Predictions = await aiResponse.json();

    asset.AI_Predictions = AI_Predictions;
    await asset.save();

    return NextResponse.json({
      message: "AI prediction generated successfully",
      AI_Predictions,
    });

  } catch (error) {
    console.error("AI Prediction Error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}