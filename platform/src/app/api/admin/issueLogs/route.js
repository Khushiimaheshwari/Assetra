import { NextResponse } from "next/server";
import { connectDB } from "../../utils/db";
import Assets from "../../../../models/Asset";

export async function GET(req) {
  try {
    await connectDB();

    const assets = await Assets.find({ "Issue_Reported.0": { $exists: true } })
      .populate("Lab_Name", "Lab_ID Lab_Name")
      .populate("PC_Name", "PC_Name")
      .populate({
        path: "Issue_Reported.FacultyDetails",
        populate: {
          path: "UserDetails",
          select: "Name Email",
        },
      })
      .populate({
        path: "Issue_Reported.Assigned_To",
        populate: {
          path: "UserDetails",
          select: "Name Email",
        },
      })
      .select(
        "Asset_Name Asset_Type Lab_Name PC_Name Issue_Reported createdAt updatedAt"
      )
      .lean();

    if (!assets || assets.length === 0) {
      return NextResponse.json({ logs: [] }, { status: 200 });
    }

    const logs = [];

    assets.forEach((asset) => {
      asset.Issue_Reported.forEach((issue) => {

        let action = "Issue Reported";
        if (issue.Status === "resolved by technician") action = "Issue Resolved";
        else if (issue.Status === "approved") action = "Issue Approved";

        let user = "Unknown";
        let role = "Unknown";

        if (issue.Status === "pending" || issue.Status === "approved") {

            user =
            issue.FacultyDetails?.UserDetails?.Name ||
            issue.FacultyDetails?.Name ||
            "Faculty";
          role = "Faculty";
        } else if (issue.Status === "resolved by technician") {

            user =
            issue.Assigned_To?.UserDetails?.Name ||
            issue.Assigned_To?.Name ||
            "Lab Technician";
          role = "Lab Technician";
        }

        const labId = asset.Lab_Name?.Lab_ID || asset.Lab_Name?._id || "UNKNOWN";
        const pcName = asset.PC_Name?.PC_Name || "";
        const assetId = pcName
          ? `${labId}-${pcName}`
          : `${labId}-${asset._id.toString().slice(-4).toUpperCase()}`;

        const statusMap = {
          pending: "Pending",
          "resolved by technician": "Resolved",
          approved: "Approved",
        };

        logs.push({
          id: issue._id.toString(),
          assetId,
          assetName: asset.Asset_Name,
          assetType: asset.Asset_Type,
          action,
          user,
          role,
          timestamp: issue.createdAt
            ? new Date(issue.createdAt).toLocaleString("en-IN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : new Date(asset.updatedAt).toLocaleString("en-IN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }),
          description: issue.IssueDescription || "No description provided.",
          resolveDescription: issue.ResolveDescription || "",
          status: statusMap[issue.Status] || "Pending",
        });
      });
    });

    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return NextResponse.json({ logs }, { status: 200 });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}