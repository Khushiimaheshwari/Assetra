import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "../../utils/db";
import { requireAdmin } from "../../utils/formsAuth";
import BreakdownForm from "../../../../models/BreakdownForm";

const ADMIN_PATCH_KEYS = [
  "actionTaken",
  "dateOfResolution",
  "resolutionRemarks",
  "verifiedByAdmin",
  "verifiedByName",
  "verifiedByDate",
  "finalStatus",
  "closureRemarks",
  "approvedBy",
  "status",
];

export async function PATCH(req, { params }) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const raw = await req.json();
    const updates = {};
    for (const key of ADMIN_PATCH_KEYS) {
      if (Object.prototype.hasOwnProperty.call(raw, key)) {
        updates[key] = raw[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    await connectDB();
    const form = await BreakdownForm.findByIdAndUpdate(
      id,
      {
        $set: {
          ...updates,
          lastAdminUpdateAt: new Date(),
          lastAdminUpdateBy: auth.user._id,
        },
      },
      { new: true, runValidators: true }
    );

    if (!form) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Updated", breakdownForm: form }, { status: 200 });
  } catch (e) {
    console.error("PATCH breakdown-forms/[id]:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
