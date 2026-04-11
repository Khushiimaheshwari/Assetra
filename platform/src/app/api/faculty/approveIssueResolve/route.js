import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { connectDB } from "../../../../app/api/utils/db";
import Assets from "../../../../models/Asset";
import Faculty from "../../../../models/Faculty";
import { User } from "../../../../models/User";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import appEventEmitter, { ISSUE_EVENTS } from "../../../../events/appEventEmitter";
import { registerIssueListeners } from "../../../../events/issueEventListener";

export async function POST(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const assetId = body.assetId ?? body.asset_id;
    const issueId = body.issueId ?? body.issue_id;

    if (!assetId || !issueId) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(assetId) || !mongoose.Types.ObjectId.isValid(issueId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const issueObjectId = new mongoose.Types.ObjectId(issueId);

    const dbUser = await User.findOne({ Email: session.user.email }).lean();
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const assetBefore = await Assets.findById(assetId)
      .populate({
        path: "Issue_Reported.Assigned_To",
        select: "UserDetails",
        populate: { path: "UserDetails", select: "_id" },
      })
      .lean();

    if (!assetBefore) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const issue = assetBefore.Issue_Reported?.find(
      (i) => i._id.toString() === issueId
    );
    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }
    if (issue.Status !== "resolved by technician") {
      return NextResponse.json(
        { error: "Issue must be resolved by technician before approval" },
        { status: 400 }
      );
    }

    const isAdmin = dbUser.Role === "admin";
    let canApprove = isAdmin;
    if (!canApprove && dbUser.Role === "faculty") {
      const facultyProfile = await Faculty.findOne({ UserDetails: dbUser._id }).lean();
      const issueFacultyId =
        issue.FacultyDetails?._id?.toString?.() ??
        issue.FacultyDetails?.toString?.() ??
        null;
      if (
        facultyProfile &&
        issueFacultyId &&
        facultyProfile._id.toString() === issueFacultyId
      ) {
        canApprove = true;
      }
    }
    if (!canApprove) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const labTechnicianUserId =
      issue.Assigned_To?.UserDetails?._id?.toString() ||
      issue.Assigned_To?.UserDetails?.toString() ||
      null;

    const updatedAsset = await Assets.findByIdAndUpdate(
      assetId,
      {
        $set: {
          "Issue_Reported.$[elem].Status": "approved",
        },
      },
      {
        new: true,
        arrayFilters: [{ "elem._id": issueObjectId }],
      }
    ).populate("Issue_Reported.FacultyDetails", "Name Email");

    if (!updatedAsset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const labId =
      assetBefore.Lab_Name?._id?.toString?.() ||
      assetBefore.Lab_Name?.toString?.() ||
      String(assetBefore.Lab_Name || "");

    const pcId =
      assetBefore.PC_Name?._id?.toString?.() ||
      assetBefore.PC_Name?.toString?.() ||
      null;

    registerIssueListeners();
    appEventEmitter.emit(ISSUE_EVENTS.RESOLVED_TO_APPROVED, {
      assetId: assetId.toString(),
      labId,
      pcId,
      issueId: issueId.toString(),
      assetName: updatedAsset.Asset_Name,
      labTechnicianUserId,
    });

    return NextResponse.json(
      {
        message: "Issue approved successfully",
        asset: updatedAsset,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error approving issue:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
