import { NextResponse } from "next/server";
import { connectDB } from "../utils/db";
import { getSessionStaff, requireLabTechnician } from "../utils/formsAuth";
import BreakdownForm from "../../../models/BreakdownForm";

const LAB_CREATE_FIELDS = new Set([
  "formName",
  "dateOfReport",
  "labName",
  "reportedByName",
  "reportedByDesignation",
  "reportedIssue",
  "equipment",
  "department",
  "reportedToName",
  "reportedToDesignation",
]);

export async function GET() {
  try {
    const auth = await getSessionStaff();
    if (auth.error) return auth.error;

    await connectDB();
    const breakdownForms = await BreakdownForm.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ breakdownForms }, { status: 200 });
  } catch (e) {
    console.error("GET breakdown-forms:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await requireLabTechnician();
    if (auth.error) return auth.error;

    const raw = await req.json();
    const body = {};
    for (const key of LAB_CREATE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(raw, key)) {
        body[key] = raw[key];
      }
    }

    const {
      formName,
      dateOfReport,
      labName,
      reportedByName,
      reportedByDesignation,
      reportedIssue,
      equipment,
      department,
      reportedToName,
      reportedToDesignation,
    } = body;

    if (!formName || !reportedByName || !reportedIssue) {
      return NextResponse.json(
        { error: "formName, reportedByName, and reportedIssue are required." },
        { status: 400 }
      );
    }

    await connectDB();

    const breakdownForm = await BreakdownForm.create({
      formName,
      dateOfReport: dateOfReport || "",
      labName: labName || "",
      reportedByName,
      reportedByDesignation: reportedByDesignation || "",
      reportedIssue,
      equipment: Array.isArray(equipment) ? equipment : [],
      department: department || "",
      reportedToName: reportedToName || "",
      reportedToDesignation: reportedToDesignation || "",
      actionTaken: "",
      dateOfResolution: "",
      resolutionRemarks: "",
      verifiedByAdmin: "",
      verifiedByName: "",
      verifiedByDate: "",
      finalStatus: "Pending",
      closureRemarks: "",
      approvedBy: "",
      status: "Pending",
      createdByUserId: auth.user._id,
      createdByRole: "lab_technician",
    });

    return NextResponse.json(
      { message: "Breakdown form submitted.", breakdownForm },
      { status: 201 }
    );
  } catch (e) {
    console.error("POST breakdown-forms:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
