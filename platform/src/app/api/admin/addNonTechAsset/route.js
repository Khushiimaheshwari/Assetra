import { NextResponse } from "next/server";
import { connectDB } from "../../utils/db";
import mongoose from "mongoose";
import Lab from "../../../../models/Labs";
import NonTechAssets from "../../../../models/NonTechAssets";
import { generateQRCodeForNonTechAsset } from "../../utils/nonTechgenerateQR";
import { explainAiFetchFailure, getPythonPredictUrl } from "../../utils/aiService";

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
    const cleanFinancialDetails = {
      purchase_year: Number(Financial_Details?.purchase_year || 0),
      purchase_cost: Number(Financial_Details?.purchase_cost || 0),
      useful_life: Number(Financial_Details?.useful_life || 0),
      breakdown_frequency: Number(Financial_Details?.breakdown_frequency || 0),
      total_maintenance_cost: Number(Financial_Details?.total_maintenance_cost || 0),
      usage_frequency: Financial_Details?.usage_frequency || "",
      warranty: Number(Financial_Details?.warranty || 0),
    };

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
      Financial_Details: cleanFinancialDetails,
    });

    await Lab.findByIdAndUpdate(LabId, {
      $push: { NonTechAssets: newAsset._id },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    console.log("Generating QR for:", newAsset._id);

    await generateQRCodeForNonTechAsset(newAsset._id, baseUrl);

    let aiData = null;
    try {
      const targetURL = getPythonPredictUrl();
      if (targetURL) {
        const aiResponse = await fetch(targetURL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newAsset.Financial_Details || {}),
        });
        if (aiResponse.ok) {
          aiData = await aiResponse.json();
          newAsset.AI_Predictions = aiData;
          await newAsset.save();
        } else {
          aiData = { error: "AI service failed during auto-prediction" };
        }
      } else {
        aiData = { error: "PYTHON_AI_SERVICE_URL not configured" };
      }
    } catch (aiErr) {
      console.error("AI prediction while adding non-tech asset failed:", aiErr);
      aiData = { error: explainAiFetchFailure(aiErr) };
    }

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