import { NextResponse } from "next/server";
import { connectDB } from "../../utils/db"
import Faculty from "../../../../models/Faculty"; 

export async function GET() {
  try {
    await connectDB();

    const faculties = await Faculty.find()
    .populate("UserDetails", "Name Email ProfileImage PhoneNumber Location AccountStatus")
    .populate("Labs", "Lab_ID Lab_Name Block Lab_Room Total_Capacity Status LabTechnician")
    .populate("Incharge_Labs", "Lab_ID Lab_Name Block Lab_Room Total_Capacity Status LabTechnician")
    .lean();

    return new Response(
      JSON.stringify({ faculty: faculties }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Error fetching faculty:", err);
    return new Response("Error fetching faculty data", { status: 500 });
  }
}