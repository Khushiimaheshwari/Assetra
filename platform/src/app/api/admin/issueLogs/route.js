import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { connectDB } from "../../utils/db";
import Assets from "../../../../models/Asset";
import Lab from "../../../../models/Labs";
import PCs from "../../../../models/Lab_PCs";
import Faculty from "../../../../models/Faculty";
import LabTechnician from "../../../../models/Lab_Technician";
import { User } from "../../../../models/User";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const dbUser = await User.findOne({ Email: session.user.email })
      .select("_id Role Email")
      .lean();

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let facultyProfileId = null;
    let labTechnicianProfileId = null;

    if (dbUser.Role === "faculty") {
      const facultyProfile = await Faculty.findOne({ UserDetails: dbUser._id })
        .select("_id")
        .lean();

      facultyProfileId = facultyProfile?._id?.toString() || null;
    }

    if (dbUser.Role === "lab_technician") {
      const technicianProfile = await LabTechnician.findOne({
        UserDetails: dbUser._id,
      })
        .select("_id")
        .lean();

      labTechnicianProfileId = technicianProfile?._id?.toString() || null;
    }

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

    const logs = [];

    assets.forEach((asset) => {
      (asset.Issue_Reported || []).forEach((issue) => {

        // ✅ FILTER BY ROLE
        if (dbUser.Role === "faculty") {
          const issueFacultyId = issue.FacultyDetails?._id?.toString();
          if (!facultyProfileId || issueFacultyId !== facultyProfileId) return;
        }

        if (dbUser.Role === "lab_technician") {
          const assignedToId = issue.Assigned_To?._id?.toString();
          if (!labTechnicianProfileId || assignedToId !== labTechnicianProfileId) return;
        }

        // ✅ ACTION
        let action = "Issue Reported";
        if (issue.Status === "resolved by technician") action = "Issue Resolved";
        else if (issue.Status === "approved") action = "Issue Approved";

        // ✅ USER NAME FIX (NO SHADOWING)
        let actionUser = "Unknown";
        let actionRole = "Unknown";

        if (issue.Status === "pending" || issue.Status === "approved") {
          actionUser =
            issue.FacultyDetails?.UserDetails?.Name ||
            "Faculty";
          actionRole = "Faculty";
        } else if (issue.Status === "resolved by technician") {
          actionUser =
            issue.Assigned_To?.UserDetails?.Name ||
            "Lab Technician";
          actionRole = "Lab Technician";
        }

        // ✅ ASSET ID
        const labId =
          asset.Lab_Name?.Lab_ID ||
          asset.Lab_Name?._id ||
          "UNKNOWN";

        const pcName = asset.PC_Name?.PC_Name || "";

        const assetId = pcName
          ? `${labId}-${pcName}`
          : `${labId}-${asset._id.toString().slice(-4).toUpperCase()}`;

        // ✅ STATUS MAP
        const statusMap = {
          pending: "Pending",
          "resolved by technician": "Resolved",
          approved: "Approved",
        };

        // ✅ RAW DATE (for sorting)
        const rawDate = issue.createdAt
          ? new Date(issue.createdAt)
          : new Date(asset.updatedAt);

        logs.push({
          id: issue._id.toString(),
          assetId,
          assetName: asset.Asset_Name,
          assetType: asset.Asset_Type,
          action,
          user: actionUser,
          role: actionRole,
          rawDate, // ✅ important
          timestamp: rawDate.toLocaleString("en-IN", {
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

    // ✅ SORT FIXED
    logs.sort((a, b) => b.rawDate - a.rawDate);

    return NextResponse.json({ logs }, { status: 200 });

  } catch (error) {
    console.error("Error fetching logs:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}