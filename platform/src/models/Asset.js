import mongoose from "mongoose"; 
 
const AssetSchema = new mongoose.Schema({
  Asset_Name: { type: String, required: true },
  Asset_Type: { type: String, enum: ["monitor", "keyboard", "mouse", "cpu" ,"ups", "Other"], required: true },
  Assest_Status: { type: String, enum: ["Yes", "No", "Other"] , required: true },
  Brand: { type: String, default: "" },
  PC_Name: { type: mongoose.Schema.Types.ObjectId, ref: "PCs", default: null },
  Lab_Name: { type: mongoose.Schema.Types.ObjectId, ref: "Lab", required: true },
  QR_Code: { type: String, default: "" },
  Financial_Details: {
    purchase_year: { type: Number },
    purchase_cost: { type: Number },
    scrap_value: { type: Number },
    useful_life: { type: Number },
    breakdown_frequency: { type: Number, default: 0 },
    total_maintenance_cost: { type: Number, default: 0 },
    usage_frequency: { type: String, enum: ["Low", "Medium", "High"] },
    warranty: { type: Number }
  },
  AI_Predictions: {
    failurePrediction: { type: Number },
    failureProbability: { type: Number },
    remainingLifePrediction: { type: Number },
    depreciationPrediction: { type: Number },
    maintenanceCostPrediction: { type: Number },
    recommendation: { type: String, enum: ["Repair", "Replace"] },
    lastPredictedAt: { type: Date }
  },
  Issue_Reported: [
    { 
      FacultyDetails: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty" },
      IssueDescription: { type: String, default: "" },
      Status: { type: String, enum: ["pending", "resolved by technician", "approved"], default: "pending" },
      Assigned_To: { type: mongoose.Schema.Types.ObjectId, ref: "LabTechnician" },
      ResolveDescription: { type: String, default: "" },
    }
  ], 
  Movement_History: [
    {
      From_Lab: { type: mongoose.Schema.Types.ObjectId, ref: "Lab" },
      To_Lab: { type: mongoose.Schema.Types.ObjectId, ref: "Lab" },
      From_PC: { type: mongoose.Schema.Types.ObjectId, ref: "PCs" },
      To_PC: { type: mongoose.Schema.Types.ObjectId, ref: "PCs" },
      Moved_By: { type: mongoose.Schema.Types.ObjectId, ref: "LabTechnician" },
      Reason: { type: String, default: "" },
      Date: { type: Date, default: Date.now }
    }
  ],
}, { timestamps: true });

const Assets = mongoose.models.Assets || mongoose.model("Assets", AssetSchema);

export default Assets;