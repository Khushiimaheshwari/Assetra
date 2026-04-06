import mongoose from "mongoose";

const BreakdownEquipmentSchema = new mongoose.Schema(
  {
    equipmentName: { type: String, default: "" },
    brand: { type: String, default: "" },
    serialNo: { type: String, default: "" },
    reportedIssue: { type: String, default: "" },
  },
  { _id: false }
);

const BreakdownFormSchema = new mongoose.Schema(
  {
    formName: { type: String, required: true, trim: true },
    dateOfReport: { type: String, default: "" },
    labName: { type: String, default: "" },
    reportedByName: { type: String, required: true, trim: true },
    reportedByDesignation: { type: String, default: "" },
    reportedIssue: { type: String, default: "" },
    equipment: { type: [BreakdownEquipmentSchema], default: [] },
    department: { type: String, default: "" },
    reportedToName: { type: String, default: "" },
    reportedToDesignation: { type: String, default: "" },
    actionTaken: { type: String, default: "" },
    dateOfResolution: { type: String, default: "" },
    resolutionRemarks: { type: String, default: "" },
    verifiedByAdmin: { type: String, default: "" },
    verifiedByName: { type: String, default: "" },
    verifiedByDate: { type: String, default: "" },
    finalStatus: {
      type: String,
      default: "Pending",
    },
    closureRemarks: { type: String, default: "" },
    approvedBy: { type: String, default: "" },
    status: { type: String, default: "Pending" },
    createdByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdByRole: {
      type: String,
      enum: ["lab_technician"],
      required: true,
    },
    lastAdminUpdateAt: { type: Date, default: null },
    lastAdminUpdateBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

const BreakdownForm =
  mongoose.models.BreakdownForm ||
  mongoose.model("BreakdownForm", BreakdownFormSchema);

export default BreakdownForm;
