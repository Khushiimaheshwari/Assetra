import { NextResponse } from "next/server";
import { connectDB } from "../../../../app/api/utils/db";
import Assets from "../../../../models/Asset";
import Faculty from "../../../../models/Faculty";
import Lab from "../../../../models/Labs";
import LabTechnician from "../../../../models/Lab_Technician";
import { User } from "../../../../models/User";
import appEventEmitter, { ISSUE_EVENTS } from "../../../../events/appEventEmitter";
import { registerIssueListeners } from "../../../../events/issueEventListener";

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

    const lab = await Lab.findById(asset.Lab_Name).select("LabTechnician").lean();
    const assignedTechId = lab?.LabTechnician?.[0] || null;

    asset.Issue_Reported.push({
      FacultyDetails: faculty._id,
      IssueDescription: description,
      Status: "pending",
      Assigned_To: assignedTechId,
      Reported_At: new Date(),
      Last_Overdue_Notification_At: null,
    });

    await asset.save();

    const newIssue = asset.Issue_Reported[asset.Issue_Reported.length - 1];

    let labTechnicianUserId = null;
    if (assignedTechId) {
      const tech = await LabTechnician.findById(assignedTechId)
        .select("UserDetails")
        .lean();
      labTechnicianUserId = tech?.UserDetails?.toString() ?? null;
    }

    registerIssueListeners();
    appEventEmitter.emit(ISSUE_EVENTS.CREATED, {
      assetId: asset._id.toString(),
      issueId: newIssue._id.toString(),
      assetName: asset.Asset_Name,
      issueDescription: description,
      labTechnicianUserId,
    });

    const updatedAsset = await Assets.findById(asset._id)
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
