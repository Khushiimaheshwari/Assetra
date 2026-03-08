import { NextResponse } from "next/server";
import { connectDB } from "../../../../app/api/utils/db";
import LabTechnician from "../../../../models/Lab_Technician";
import { User } from "../../../../models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    console.log(session);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "lab_technician") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const email = session.user.email;

    const user = await User.findOne({ Email: email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const technician = await LabTechnician.findOne({
      UserDetails: user._id,
    }).populate({
      path: "Labs",
      populate: {
        path: "LabTechnician",
        select: "UserDetails",
      },
    });

    if (!technician) {
      return NextResponse.json(
        { error: "Technician not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ labs: technician.Labs });

  } catch (error) {
    console.error("Error fetching labs:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}