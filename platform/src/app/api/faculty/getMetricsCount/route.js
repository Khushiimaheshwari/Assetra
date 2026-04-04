import { NextResponse } from "next/server";
import { connectDB } from "../../../../app/api/utils/db";
import Lab from "../../../../models/Labs";
import PCs from "../../../../models/Lab_PCs";
import Faculty from "../../../../models/Faculty";
import { User } from "../../../../models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

export async function GET(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "faculty") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await User.findOne({ Email: session.user.email });

    const faculty = await Faculty.findOne({ UserDetails: user._id })
      .populate("Labs")
      .populate("Incharge_Labs")
      .lean();

    if (!faculty) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
    }

    const normalLabs = faculty.Labs || [];
    const inchargeLabs = faculty.Incharge_Labs || [];

    // ✅ Merge labs
    const labsMap = new Map();
    [...normalLabs, ...inchargeLabs].forEach((lab) => {
      labsMap.set(lab._id.toString(), lab);
    });

    const labs = Array.from(labsMap.values());

    // ✅ Metrics
    let totalLabAssets = 0;

    for (const lab of labs) {
      const pcs = await PCs.find({ Lab: lab._id }).select("Assets").lean();

      pcs.forEach((pc) => {
        if (Array.isArray(pc.Assets)) {
          totalLabAssets += pc.Assets.length;
        }
      });
    }

    const metrics = {
      totalLabs: labs.length,
      totalLabAssets,
    };

    // ✅ Category
    let technical = 0;
    let nonTechnical = 0;

    labs.forEach((lab) => {
      const name = lab.Lab_Name.toLowerCase();

      if (
        name.includes("computer science") ||
        name.includes("electronics") ||
        name.includes("mechanics")
      ) {
        technical++;
      } else {
        nonTechnical++;
      }
    });

    const assetCategoryData = [
      { name: "Technical", value: technical, color: "#10b981" },
      { name: "Non-Technical", value: nonTechnical, color: "#3b82f6" }
    ];

    // ✅ Lab Distribution
    const labDistributionMap = {
      "Computer Science": 0,
      Chemistry: 0,
      Mechanics: 0,
      Electronics: 0,
      Others: 0
    };

    labs.forEach((lab) => {
      const name = lab.Lab_Name.toLowerCase();

      if (name.includes("computer science")) labDistributionMap["Computer Science"]++;
      else if (name.includes("chemistry")) labDistributionMap["Chemistry"]++;
      else if (name.includes("mechanics")) labDistributionMap["Mechanics"]++;
      else if (name.includes("electronics")) labDistributionMap["Electronics"]++;
      else labDistributionMap["Others"]++;
    });

    const colors = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"];

    const labDistributionData = Object.entries(labDistributionMap).map(
      ([name, value], index) => ({ name, value, color: colors[index] })
    );

    return NextResponse.json({
      facultyName: user.Name,
      facultyEmail: user.Email,
      metrics,
      labs,
      inchargeLabs, // ✅ added
      assetCategoryData,
      labDistributionData
    });

  } catch (error) {
    console.error("Error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}