import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  beautyCenterId: { type: mongoose.Schema.Types.ObjectId, ref: "BeautyCenter", required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" }, // opsiyonel
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "cancelled", "completed", "no-show"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Appointment", appointmentSchema);
