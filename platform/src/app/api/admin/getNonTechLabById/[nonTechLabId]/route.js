import { NextResponse } from "next/server";
import { connectDB } from "../../../../../app/api/utils/db";
import LabTechnician from "../../../../../models/Lab_Technician";
import Faculty from "../../../../../models/Faculty";
import Lab from "../../../../../models/Labs";
import NonTechAssets from "../../../../../models/NonTechAssets"

export async function GET(req, context) {
  try {
    await connectDB();
    const { nonTechLabId: id } = await context.params;
    console.log(id);

    const lab = await Lab.findById(id
    )
      .populate("NonTechAssets")
      .populate({
        path: "LabTechnician",
        populate: {
          path: "UserDetails",
          model: "User",
        },
      })
      .populate({
        path: "Lab_Incharge",
        populate: {
          path: "UserDetails",
          model: "User",
        },
      });
    
    return NextResponse.json({ lab });
  } catch (error) {
    console.error("Error fetching labs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
