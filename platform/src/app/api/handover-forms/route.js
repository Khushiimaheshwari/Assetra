import { NextResponse } from "next/server";
import { connectDB } from "../utils/db";
import { getSessionStaff } from "../utils/formsAuth";
import HandoverForm from "../../../models/HandoverForm";

export async function GET() {
  try {
    const auth = await getSessionStaff();
    if (auth.error) return auth.error;
    const { user } = auth;

    await connectDB();
    const query =
      user.Role === "lab_technician"
        ? { createdByUserId: user._id, createdByRole: "lab_technician" }
        : {};

    const handoverForms = await HandoverForm.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ handoverForms }, { status: 200 });
  } catch (e) {
    console.error("GET handover-forms:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await getSessionStaff();
    if (auth.error) return auth.error;

    const { user } = auth;
    const body = await req.json();

    const {
      formName,
      labName,
      handoverDate,
      handoverByName,
      handoverByDesignation,
      handoverToName,
      handoverToDesignation,
      purpose,
      equipment,
      status,
    } = body;

    if (!formName || !handoverByName || !handoverToName) {
      return NextResponse.json(
        { error: "formName, handoverByName, and handoverToName are required." },
        { status: 400 }
      );
    }

    await connectDB();

    const isAdmin = user.Role === "admin";
    const doc = {
      formName,
      labName: labName || "",
      handoverDate: handoverDate || "",
      handoverByName,
      handoverByDesignation: handoverByDesignation || "",
      handoverToName,
      handoverToDesignation: handoverToDesignation || "",
      purpose: purpose || "",
      equipment: Array.isArray(equipment) ? equipment : [],
      createdByUserId: user._id,
      createdByRole: isAdmin ? "admin" : "lab_technician",
      approvalStatus: isAdmin ? "not_required" : "pending",
      rejectionReason: "",
      reviewedByUserId: null,
      reviewedAt: null,
    };

    if (isAdmin) {
      doc.status = status && ["Pending", "In Progress", "Completed"].includes(status)
        ? status
        : "Pending";
    } else {
      doc.status = "Pending";
    }

    const handoverForm = await HandoverForm.create(doc);

    return NextResponse.json(
      { message: "Handover form created.", handoverForm },
      { status: 201 }
    );
  } catch (e) {
    console.error("POST handover-forms:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
