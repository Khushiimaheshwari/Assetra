// app/api/admin/amc/contracts/route.js
import { NextResponse } from "next/server";
import { connectDB } from "../../../utils/db";
import Assets from "../../../../../models/Asset";
import Lab from "../../../../../models/Labs";
import PCs from "../../../../../models/Lab_PCs";

export async function GET() {
  try {
    await connectDB();

    // Fetch all assets that have warranty info
    const assets = await Assets.find({
      "Financial_Details.warranty": { $exists: true, $ne: null },
    })
      .populate("Lab_Name", "Lab_ID Lab_Name")
      .populate("PC_Name", "PC_Name")
      .select(
        "Asset_Name Asset_Type Brand Lab_Name PC_Name Financial_Details createdAt"
      )
      .lean();

    const contracts = assets.map((asset) => {
      const fin = asset.Financial_Details || {};
      const labId =
        asset.Lab_Name?.Lab_ID || asset.Lab_Name?._id?.toString()?.slice(-4) || "???";
      const pcName = asset.PC_Name?.PC_Name || "";
      const assetId = pcName
        ? `${labId}-${pcName}`
        : `${labId}-${asset._id.toString().slice(-4).toUpperCase()}`;

      // Derive warranty end date from purchase_year + warranty (years)
      const purchaseYear = fin.purchase_year;
      const warrantyYears = fin.warranty ?? 0;
      let warrantyEnd = null;
      if (purchaseYear && warrantyYears) {
        warrantyEnd = new Date(purchaseYear + warrantyYears, 0, 1)
          .toISOString()
          .slice(0, 10);
      }
      const warrantyStart = purchaseYear
        ? `${purchaseYear}-01-01`
        : null;

      return {
        _id: asset._id,
        assetId,
        assetName: asset.Asset_Name,
        assetType: asset.Asset_Type,
        brand: asset.Brand || "—",
        lab: asset.Lab_Name?.Lab_Name || labId,
        purchaseCost: fin.purchase_cost ?? null,
        purchaseYear: fin.purchase_year ?? null,
        warrantyYears: warrantyYears,
        warrantyStart,
        warrantyEnd,
        totalMaintenanceCost: fin.total_maintenance_cost ?? 0,
        breakdownFrequency: fin.breakdown_frequency ?? 0,
        usageFrequency: fin.usage_frequency ?? "—",
      };
    });

    return NextResponse.json({ contracts }, { status: 200 });
  } catch (error) {
    console.error("Error fetching AMC contracts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}