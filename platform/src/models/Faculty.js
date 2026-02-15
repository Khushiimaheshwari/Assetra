import mongoose from "mongoose";
 
const FacultySchema = new mongoose.Schema({
  UserDetails: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  Designation: { type: String, default: "" },
  Department: { type: String, default: "" },
  Labs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lab" }],
  Incharge_Labs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lab" }],
}, { timestamps: true });

const Faculty = mongoose.models.Faculty || mongoose.model("Faculty", FacultySchema);

export default Faculty;