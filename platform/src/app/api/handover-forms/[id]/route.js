import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "../../utils/db";
import { requireAdmin } from "../../utils/formsAuth";
import HandoverForm from "../../../../models/HandoverForm";

export async function PATCH(req, { params }) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const { action, rejectionReason } = body;

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "action must be approve or reject" },
        { status: 400 }
      );
    }

    if (action === "reject") {
      const reason = (rejectionReason || "").trim();
      if (!reason) {
        return NextResponse.json(
          { error: "rejectionReason is required when rejecting" },
          { status: 400 }
        );
      }
    }

    await connectDB();
    const form = await HandoverForm.findById(id);
    if (!form) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (form.approvalStatus !== "pending") {
      return NextResponse.json(
        { error: "This handover is not awaiting approval" },
        { status: 400 }
      );
    }

    const now = new Date();
    if (action === "approve") {
      form.approvalStatus = "approved";
      form.rejectionReason = "";
      form.reviewedByUserId = auth.user._id;
      form.reviewedAt = now;
    } else {
      form.approvalStatus = "rejected";
      form.rejectionReason = (rejectionReason || "").trim();
      form.reviewedByUserId = auth.user._id;
      form.reviewedAt = now;
    }

    await form.save();

    return NextResponse.json({ message: "Updated", handoverForm: form }, { status: 200 });
  } catch (e) {
    console.error("PATCH handover-forms/[id]:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
