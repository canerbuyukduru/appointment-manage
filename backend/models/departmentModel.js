import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
  beautyCenterId: { type: mongoose.Schema.Types.ObjectId, ref: "BeautyCenter", required: true },
  name: { type: String, required: true }, // örn: "Tırnak", "Epilasyon"
  roomCount: { type: Number, default: 1 }, // aynı anda kaç oda çalışabilir
  description: { type: String },
});

export default mongoose.model("Department", departmentSchema);
