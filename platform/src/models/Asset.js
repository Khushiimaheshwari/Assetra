import mongoose from "mongoose";
import { connectDB } from "../app/api/utils/db.js";
import Faculty from "./Faculty.js";
 
const AssetSchema = new mongoose.Schema({
  Asset_Name: { type: String, required: true },
  Asset_Type: { type: String, enum: ["monitor", "keyboard", "mouse", "cpu" ,"ups", "Other"], required: true },
  Assest_Status: { type: String, enum: ["Yes", "No", "Other"] , required: true },
  Brand: { type: String, default: "" },
  PC_Name: { type: mongoose.Schema.Types.ObjectId, ref: "PCs", default: null },
  Lab_Name: { type: mongoose.Schema.Types.ObjectId, ref: "Lab", required: true },
  QR_Code: { type: String, default: "" },
  Issue_Reported: [
    { 
      FacultyDetails: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty" },
      IssueDescription: { type: String, default: "" },
      Status: { type: String, enum: ["pending", "resolved by technician", "approved"], default: "pending" },
      ResolveDescription: { type: String, default: "" },
    }
  ], 
  Movement_History: [
    {
      From_Lab: { type: mongoose.Schema.Types.ObjectId, ref: "Lab" },
      To_Lab: { type: mongoose.Schema.Types.ObjectId, ref: "Lab" },
      From_PC: { type: mongoose.Schema.Types.ObjectId, ref: "PCs" },
      To_PC: { type: mongoose.Schema.Types.ObjectId, ref: "PCs" },
      Moved_By: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty" },
      Reason: { type: String, default: "" },
      Date: { type: Date, default: Date.now }
    }
  ],
}, { timestamps: true });

const Assets = mongoose.models.Assets || mongoose.model("Assets", AssetSchema);

export default Assets;