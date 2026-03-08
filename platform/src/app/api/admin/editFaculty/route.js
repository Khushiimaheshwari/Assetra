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
    console.log("EDIT FACULTY BODY:", body);

    const {
      name,
      email,
      password,
      department,
      designation,
      labAccess = [],
      labIncharge = []
    } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and Email are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ Email: email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const faculty = await Faculty.findOne({ UserDetails: user._id });
    if (!faculty) {
      return NextResponse.json(
        { error: "Faculty not found" },
        { status: 404 }
      );
    }

    if (password && password.trim() !== "") {
      user.Password = await bcrypt.hash(password, 10);
    }

    user.Name = name;
    user.Email = email;
    await user.save();

    const validLabs = labAccess.filter((id) =>
      mongoose.isValidObjectId(id)
    );

    const validInchargeLabs = labIncharge.filter((id) =>
      mongoose.isValidObjectId(id)
    );

    await Lab.updateMany(
      { Lab_Incharge: faculty._id },
      { $pull: { Lab_Incharge: faculty._id } }
    );

    if (validInchargeLabs.length > 0) {
      await Lab.updateMany(
        { _id: { $in: validInchargeLabs } },
        { $addToSet: { Lab_Incharge: faculty._id } }
      );
    }

    faculty.Department = department;
    faculty.Designation = designation;
    faculty.Labs = validLabs;
    faculty.Incharge_Labs = validInchargeLabs;

    await faculty.save();

    return NextResponse.json({
      message: "Faculty updated successfully",
      faculty: {
        _id: faculty._id,
        name: user.Name,
        email: user.Email,
        department: faculty.Department,
        designation: faculty.Designation,
        labs: faculty.Labs,
        inchargeLabs: faculty.Incharge_Labs,
      },
    });

  } catch (error) {
    console.error("Error updating faculty:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}