import { NextResponse } from "next/server";
import { connectDB } from "../../../../app/api/utils/db";
import Assets from "../../../../models/Asset";
import Faculty from "../../../../models/Faculty";
import { User } from "../../../../models/User";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { asset_id, facultyId, description } = body;

    if (!asset_id || !facultyId || !description) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const user = await User.findById(facultyId);
    if (!user) {
      return NextResponse.json(
        { error: "No user found." },
        { status: 404 }
      );
    }

    const faculty = await Faculty.findOne({ UserDetails: user._id });
    if (!faculty) {
      return NextResponse.json(
        { error: "No faculty found for this user." },
        { status: 404 }
      );
    }

    const asset = await Assets.findById(asset_id);
    if (!asset) {
      return NextResponse.json(
        { error: "No asset found." },
        { status: 404 }
      );
    }

    const updatedAsset = await Assets.findByIdAndUpdate(
      asset_id,
      {
        $push: {
          Issue_Reported: {
            FacultyDetails: faculty._id,
            IssueDescription: description,
            Status: "pending",
          },
        },
      },
      { new: true }
    )
      .populate({
        path: "Issue_Reported.FacultyDetails",
        populate: {
          path: "UserDetails",
          select: "Name Email",
        },
      });

    return NextResponse.json(
      {
        message: "Issue added successfully",
        asset: updatedAsset,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error adding issue:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
