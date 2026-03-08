import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../../app/api/utils/db";
import Faculty from "../../../../models/Faculty";
import { User } from "../../../../models/User";
import Lab from "../../../../models/Labs";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    console.log("BODY:", body);

    const {
      name,
      email,
      password,
      department,
      designation,
      labAccess = [],
      labIncharge = []
    } = body;

    if (!name || !email || !password || !department || !designation) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ Email: email });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      Name: name,
      Email: email,
      Password: hashedPassword,
      Role: "faculty",
    });

    const validLabs = labAccess.filter((id) =>
      mongoose.isValidObjectId(id)
    );

    const validInchargeLabs = labIncharge.filter((id) =>
      mongoose.isValidObjectId(id)
    );

    const newFaculty = await Faculty.create({
      UserDetails: newUser._id,
      Department: department,
      Designation: designation,
      Labs: validLabs,
      Incharge_Labs: validInchargeLabs,
    });

    if (validInchargeLabs.length > 0) {
      await Lab.updateMany(
        { _id: { $in: validInchargeLabs } },
        { $addToSet: { Lab_Incharge: newFaculty._id } }
      );
    }

    return NextResponse.json({
      message: "Faculty created successfully",
      faculty: newFaculty,
    });

  } catch (error) {
    console.error("Faculty creation error:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}