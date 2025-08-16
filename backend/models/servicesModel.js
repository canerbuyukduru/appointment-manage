import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String },
    duration: { type: Number, required: true }, // dakika cinsinden
    price: { type: Number, required: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Service = mongoose.model("Service", serviceSchema);

export default Service;
