import { NextResponse } from "next/server";
import { connectDB } from "../../utils/db";
import HandoverForm from "../../../../models/HandoverForm";

export async function GET() {
  try {
    await connectDB();

    const handoverForms = await HandoverForm.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ handoverForms }, { status: 200 });
  } catch (error) {
    console.error("Error fetching handover forms:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}