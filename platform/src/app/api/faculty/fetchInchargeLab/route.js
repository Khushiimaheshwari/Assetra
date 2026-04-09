import { NextResponse } from "next/server";
import Faculty from "../../../../models/Faculty";
import Lab from "../../../../models/Labs";
import LabTechnician from "../../../../models/Lab_Technician";
import { User } from "../../../../models/User";
import { connectDB } from "../../utils/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

export async function GET(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;

    const user = await User.findOne({ Email: email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const faculty = await Faculty.findOne({ UserDetails: user._id }).lean();
    if (!faculty) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
    }

    const labIds = faculty.Incharge_Labs || [];

    if (labIds.length === 0) {
      return NextResponse.json({ inchargeLabs: [] }, { status: 200 });
    }

    const labs = await Lab.find({ _id: { $in: labIds } })
      .select("Lab_ID Lab_Name Block Lab_Room Total_Capacity Status LabTechnician")
      .populate({
        path: "LabTechnician",
        populate: {
          path: "UserDetails",
          select: "Name Email",
        },
      })
      .lean();

    return NextResponse.json({ inchargeLabs: labs }, { status: 200 });

  } catch (error) {
    console.error("Error fetching faculty incharge labs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}