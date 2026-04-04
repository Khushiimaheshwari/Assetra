import { NextResponse } from "next/server";
import { connectDB } from "../../../../app/api/utils/db";
import Assets from "../../../../models/Asset";
import appEventEmitter, { ISSUE_EVENTS } from "../../../../events/appEventEmitter";
import { registerIssueListeners } from "../../../../events/issueEventListener";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { assetId, issueId } = body;

    if (!assetId || !issueId) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
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
        arrayFilters: [{ "elem._id": issueId }],
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
