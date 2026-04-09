import { NextResponse } from "next/server";
import { connectDB } from "../../utils/db";
import mongoose from "mongoose";
import Lab_PCs from "../../../../models/Lab_PCs";
import Assets from "../../../../models/Asset";
import { generateQRCodeForAsset } from "../../utils/generateQR";
 
export async function POST(req) { 
  try {
    await connectDB();

    const body = await req.json();
    
    const { Asset_Name, Asset_Type, Assest_Status, PC, Lab, Brand, Financial_Details } = body;
    const cleanFinancialDetails = {
      purchase_year: Number(Financial_Details?.purchase_year || 0),
      purchase_cost: Number(Financial_Details?.purchase_cost || 0),
      useful_life: Number(Financial_Details?.useful_life || 0),
      breakdown_frequency: Number(Financial_Details?.breakdown_frequency || 0),
      total_maintenance_cost: Number(Financial_Details?.total_maintenance_cost || 0),
      usage_frequency: Financial_Details?.usage_frequency || "",
      warranty: Number(Financial_Details?.warranty || 0),
    };

    if (!Asset_Name || !Asset_Type || !Assest_Status || !PC || !Lab) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const existingAsset = await Assets.findOne({ Asset_Name: Asset_Name });
    if (existingAsset) {
      return NextResponse.json({ error: "Asset with this ID already exists" }, { status: 409 });
    }

    const newAsset = await Assets.create({
      Asset_Name: Asset_Name,
      Asset_Type: Asset_Type.toLowerCase(),
      Assest_Status: Assest_Status,
      Brand: Brand,
      PC_Name: [new mongoose.Types.ObjectId(PC)],
      Lab_Name: [new mongoose.Types.ObjectId(Lab)],
      QR_Code: "",
      Financial_Details: cleanFinancialDetails,
    });

    await Lab_PCs.findByIdAndUpdate(PC, {
      $push: { Assets: newAsset._id },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    console.log("Generating QR for:", newAsset._id, "Base:", baseUrl);

    await generateQRCodeForAsset(newAsset._id, baseUrl);

    let aiData = null;
    try {
      const pythonServiceURL = process.env.PYTHON_AI_SERVICE_URL;
      if (pythonServiceURL) {
        const targetURL = pythonServiceURL.endsWith("/predict")
          ? pythonServiceURL
          : `${pythonServiceURL.replace(/\/$/, "")}/predict`;
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
      console.error("AI prediction while adding asset failed:", aiErr);
      aiData = { error: "AI prediction failed during asset creation" };
    }

    return NextResponse.json({
      message: "Asset added successfully",
      asset: newAsset,
      AI: aiData,
    });
  } catch (error) {
    console.error("Error adding Asset:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
