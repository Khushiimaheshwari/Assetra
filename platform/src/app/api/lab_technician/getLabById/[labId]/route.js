import { NextResponse } from "next/server";
import { connectDB } from "../../../utils/db";
import Lab from "../../../../../models/Labs";
import PCs from "../../../../../models/Lab_PCs";
import LabTechnician from "../../../../../models/Lab_Technician";
import Faculty from "../../../../../models/Faculty";

export async function GET(req, context) {
  try {
    await connectDB();
    const { labId: id } = await context.params;

    const lab = await Lab.findById(id
    )
      .populate("PCs")
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