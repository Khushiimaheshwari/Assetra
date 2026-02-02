import mongoose from "mongoose";
 
const LabTechnicianSchema = new mongoose.Schema({
  UserID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  Labs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lab" }],

}, { timestamps: true });

const LabTechnician = mongoose.models.LabTechnician || mongoose.model("LabTechnician", LabTechnicianSchema);

export default LabTechnician;