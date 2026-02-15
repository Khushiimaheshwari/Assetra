import mongoose from "mongoose";
 
const LabTechnicianSchema = new mongoose.Schema({
  UserDetails: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  Labs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lab" }],
  Issues: [{
    Asset: { type: mongoose.Schema.Types.ObjectId, ref: "Asset" },
    Issue_Description: { type: String, default: "" },
    Issue_Status: { type: String, default: "" },
  }],
}, { timestamps: true });

const LabTechnician = mongoose.models.LabTechnician || mongoose.model("LabTechnician", LabTechnicianSchema);

export default LabTechnician;