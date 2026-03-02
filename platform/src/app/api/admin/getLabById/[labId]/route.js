import { NextResponse } from "next/server";
import { connectDB } from "../../../../../app/api/utils/db";
import Lab from "../../../../../models/Labs";
import LabTechnician from "../../../../../models/Lab_Technician";
import Faculty from "../../../../../models/Faculty";
import Lab_PCs from "../../../../../models/Lab_PCs";

export async function GET(req, context) {
  try {
    await connectDB();
    const { labId: id } = await context.params;

    const lab = await Lab.findById(id
    )
      .populate("LabTechnician", "Name Email ")
      .populate("Lab_Incharge", "Name Email")
      .populate("PCs")
    
    return NextResponse.json({ lab });
  } catch (error) {
    console.error("Error fetching labs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
