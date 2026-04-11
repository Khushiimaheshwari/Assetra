import { NextResponse } from "next/server";
import { connectDB } from "../../../../app/api/utils/db";
import Assets from "../../../../models/Asset";
import NonTechAssets from "../../../../models/NonTechAssets";
import { explainAiFetchFailure, getPythonPredictUrl } from "../../utils/aiService";

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

    let asset = await Assets.findById(assetId);
    let assetCollection = "Assets";
    if (!asset) {
      asset = await NonTechAssets.findById(assetId);
      assetCollection = "NonTechAssets";
    }

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

    const targetURL = getPythonPredictUrl();

    if (!targetURL) {
      return NextResponse.json(
        { error: "Python service URL not configured" },
        { status: 500 }
      );
    }

    const aiResponse = await fetch(targetURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(asset.Financial_Details),
    });

    if (!aiResponse.ok) {
      const aiErrorText = await aiResponse.text();
      return NextResponse.json(
        { error: "AI service failed", details: aiErrorText },
        { status: 500 }
      );
    }

    const AI_Predictions = await aiResponse.json();

    asset.AI_Predictions = AI_Predictions;
    await asset.save();

    return NextResponse.json({
      message: "AI prediction generated successfully",
      AI_Predictions,
      assetCollection,
    });

  } catch (error) {
    console.error("AI Prediction Error:", error);
    const code = error?.cause?.code ?? error?.code;
    if (code === "ECONNREFUSED") {
      return NextResponse.json(
        { error: explainAiFetchFailure(error) },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}