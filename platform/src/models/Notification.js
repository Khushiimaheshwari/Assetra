import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["maintenance", "issue"],
      required: true,
    },
    isRead: { type: Boolean, default: false, index: true },
    createdAt: { type: Date, default: Date.now },
    linkLabId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lab",
      default: null,
    },
    /** Hardware asset document id (optional; not used for in-app URLs). */
    linkAssetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assets",
      default: null,
    },
    /** PC document id — used in /lab/[labId]/asset/[pcId] (param is PC, not hardware asset). */
    linkPcId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PCs",
      default: null,
    },
    linkMaintenanceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { versionKey: false }
);

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);

export default Notification;
