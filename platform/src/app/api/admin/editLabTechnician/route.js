import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../utils/db";
import LabTechnician from "../../../../models/Lab_Technician";
import Lab from "../../../../models/Labs";
import { User } from "../../../../models/User";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, email, password, labAccess = [] } = body;

    console.log("EDIT BODY:", body);

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

    const technician = await LabTechnician.findOne({
      UserDetails: user._id,
    });

    if (!technician) {
      return NextResponse.json(
        { error: "Lab Technician not found" },
        { status: 404 }
      );
    }

    if (password && password.trim() !== "") {
      user.Password = await bcrypt.hash(password, 10);
    }

    user.Name = name;
    user.Email = email;
    await user.save();

    const labObjectIds = labAccess
      .filter((id) => mongoose.isValidObjectId(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    await Lab.updateMany(
      { LabTechnician: technician._id },
      { $pull: { LabTechnician: technician._id } }
    );

    if (labObjectIds.length > 0) {
      await Lab.updateMany(
        { _id: { $in: labObjectIds } },
        { $addToSet: { LabTechnician: technician._id } }
      );
    }

    technician.Labs = labObjectIds;
    await technician.save();

    return NextResponse.json({
      message: "Lab Technician updated successfully",
      updatedTechnician: {
        _id: technician._id,
        name: user.Name,
        email: user.Email,
        labs: technician.Labs,
      },
    });

  } catch (error) {
    console.error("Error updating lab technician:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}