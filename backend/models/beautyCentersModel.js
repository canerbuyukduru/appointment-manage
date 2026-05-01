import mongoose from "mongoose";

const workingDaySchema = new mongoose.Schema(
  {
    isClosed: { type: Boolean, default: false },
    open: { type: String, default: "09:00" },
    close: { type: String, default: "18:00" },
  },
  { _id: false }
);

const holidaySchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // "2025-07-12" gibi
    reason: { type: String },
  },
  { _id: false }
);

const beautyCenterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    address: {
      type: mongoose.Schema.Types.Mixed, // string veya object olabilir
      required: true,
    },

    phone: { type: String, required: true },
    email: { type: String },
    description: { type: String },

    location: {
      type: mongoose.Schema.Types.Mixed, // ileride { lat, lng } olabilir
      required: false,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isApproved: { type: Boolean, default: false },

    // Çalışma saatleri
    workingHours: {
      monday: workingDaySchema,
      tuesday: workingDaySchema,
      wednesday: workingDaySchema,
      thursday: workingDaySchema,
      friday: workingDaySchema,
      saturday: workingDaySchema,
      sunday: workingDaySchema,
    },

    // Tatil günleri
    customHolidays: [holidaySchema],
  },
  { timestamps: true }
);

beautyCenterSchema.index({ ownerId: 1 });
beautyCenterSchema.index({ isApproved: 1 });
beautyCenterSchema.index({ email: 1 });

const BeautyCenter = mongoose.model("BeautyCenter", beautyCenterSchema);
export default BeautyCenter;
