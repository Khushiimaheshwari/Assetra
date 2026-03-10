// app/api/admin/addHandoverForm/route.js
import { NextResponse } from "next/server";
import { connectDB } from "../../utils/db";
import HandoverForm from "../../../../models/HandoverForm";

export async function POST(req) {
  try {
    await connectDB();

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

    const newForm = await HandoverForm.create({
      formName,
      labName:               labName               || "",
      handoverDate:          handoverDate           || "",
      handoverByName,
      handoverByDesignation: handoverByDesignation  || "",
      handoverToName,
      handoverToDesignation: handoverToDesignation  || "",
      purpose:               purpose                || "",
      equipment:             Array.isArray(equipment) ? equipment : [],
      status:                status                 || "Pending",
    });

    return NextResponse.json(
      { message: "Handover form created successfully.", handoverForm: newForm },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding handover form:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}