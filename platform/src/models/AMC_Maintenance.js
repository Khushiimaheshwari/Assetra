import mongoose from "mongoose";

const AMCMaintenanceSchema = new mongoose.Schema(
  {
    Asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assets",
      required: true,
    },
    Asset_Name: { type: String, default: "" },
    Asset_Type: { type: String, default: "" },
    Lab_Name:   { type: mongoose.Schema.Types.ObjectId, ref: "Lab" },

    Scheduled_Date: { type: Date, required: true },
    Completed_Date: { type: Date, default: null },

    Technician: { type: mongoose.Schema.Types.ObjectId, ref: "LabTechnician" },
    Technician_Name: { type: String, default: "" }, // denormalised

    Work_Done: { type: String, default: "" },       // description of service
    Cost:      { type: Number, default: 0 },        // actual cost incurred

    Status: {
      type: String,
      enum: ["Scheduled", "In Progress", "Completed", "Cancelled"],
      default: "Scheduled",
    },

    Notes: { type: String, default: "" },
  },
  { timestamps: true }
);

const AMCMaintenance =
  mongoose.models.AMCMaintenance ||
  mongoose.model("AMCMaintenance", AMCMaintenanceSchema);

export default AMCMaintenance;