import { NextResponse } from "next/server";
import { connectDB } from "../../../../app/api/utils/db";
import LabTechnician from "../../../../models/Lab_Technician";
import Lab from "../../../../models/Labs";

export async function GET() {
  try {
    await connectDB();
 
    const technicians = await LabTechnician.find()
    .populate("Labs", "Lab_ID Lab_Name Block Lab_Room Total_Capacity Status LabTechnician")
    .populate("UserDetails", "Name Email ProfileImage PhoneNumber Location AccountStatus")
    .populate("Issues", "Asset Issue_Description Issue_Status")
    .lean();

    return NextResponse.json({ technicians });
  } catch (error) {
    console.error("Error fetching lab technicians:", error);
    return NextResponse.json(
      { error: "Failed to fetch lab technicians" },
      { status: 500 }
    );
  }
}
