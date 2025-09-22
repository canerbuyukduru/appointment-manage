import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    // kim
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    beautyCenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BeautyCenter",
      required: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    // ne zaman
    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },

    // durum
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "cancelled",
        "completed",
        "no-show",
      ],
      default: "pending",
    },
    cancelledAt: { type: Date },
    expireAt: { type: Date, default: null }, // sadece silinecekler için set edilir
    reminderSent: { type: Boolean, default: false },
    attended: { type: Boolean, default: null }, // owner işaretler: true/false/null

    // snapshot (hizmet değişse bile kayıt sabit kalsın)
    serviceSnapshot: {
      name: String,
      duration: Number, // dk
      price: Number,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Owner'ı referans eder
      default: null, // Müşteri kendi oluşturduysa null kalır
    },

    notes: {
      type: String,
      default: "",
    },
    reminderSent: {
      type: Boolean,
      default: false, // Hatırlatma email'i gönderildi mi?
    },

    emailsSent: {
      created: { type: Boolean, default: false },
      approved: { type: Boolean, default: false },
      rejected: { type: Boolean, default: false },
      reminder: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// performans/kurallar için index’ler
appointmentSchema.index({
  userId: 1,
  departmentId: 1,
  startDateTime: 1,
  status: 1,
});
appointmentSchema.index({
  beautyCenterId: 1,
  departmentId: 1,
  startDateTime: 1,
  endDateTime: 1,
  status: 1,
});
appointmentSchema.index({ userId: 1, startDateTime: -1 });
appointmentSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Appointment", appointmentSchema);
