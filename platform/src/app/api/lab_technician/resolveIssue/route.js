import { NextResponse } from "next/server";
import { connectDB } from "../../../../app/api/utils/db";
import Assets from "../../../../models/Asset";
import appEventEmitter, { ISSUE_EVENTS } from "../../../../events/appEventEmitter";
import { registerIssueListeners } from "../../../../events/issueEventListener";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { assetId, issueId, resolveDescription } = body;

    if (!assetId || !issueId || !resolveDescription) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const assetBefore = await Assets.findById(assetId)
      .populate({
        path: "Issue_Reported.FacultyDetails",
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
    if (issue.Status !== "pending") {
      return NextResponse.json(
        { error: "Issue is not in pending status" },
        { status: 400 }
      );
    }

    const facultyUserId =
      issue.FacultyDetails?.UserDetails?._id?.toString() ||
      issue.FacultyDetails?.UserDetails?.toString() ||
      null;

    const updatedAsset = await Assets.findByIdAndUpdate(
      assetId,
      {
        $set: {
          "Issue_Reported.$[elem].ResolveDescription": resolveDescription,
          "Issue_Reported.$[elem].Status": "resolved by technician",
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
    appEventEmitter.emit(ISSUE_EVENTS.PENDING_TO_RESOLVED, {
      assetId: assetId.toString(),
      labId,
      pcId,
      issueId: issueId.toString(),
      assetName: updatedAsset.Asset_Name,
      facultyUserId,
      resolveDescription,
    });

    return NextResponse.json(
      {
        message: "Issue resolved successfully",
        asset: updatedAsset,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error resolving issue:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
