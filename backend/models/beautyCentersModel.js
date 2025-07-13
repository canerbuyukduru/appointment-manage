import mongoose from 'mongoose';

const beautyCenterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    // address alanı hem eski string hem yeni object olarak desteklenebilir
    address: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    phone: { type: String, required: true },
    email: { type: String },
    description: { type: String },

    // Google Maps konumu:
    // location alanı da Mixed olarak tanımlanabilir (string veya object gelebilir)
    location: {
      type: mongoose.Schema.Types.Mixed,
      required: false
    },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isApproved: { type: Boolean, default: false },

    // 📆 Çalışma saatleri:
    workingHours: {
      monday: {
        isClosed: { type: Boolean, default: false },
        open: { type: String, default: "09:00" },
        close: { type: String, default: "18:00" }
      },
      tuesday: {
        isClosed: { type: Boolean, default: false },
        open: { type: String, default: "09:00" },
        close: { type: String, default: "18:00" }
      },
      wednesday: {
        isClosed: { type: Boolean, default: false },
        open: { type: String, default: "09:00" },
        close: { type: String, default: "18:00" }
      },
      thursday: {
        isClosed: { type: Boolean, default: false },
        open: { type: String, default: "09:00" },
        close: { type: String, default: "18:00" }
      },
      friday: {
        isClosed: { type: Boolean, default: false },
        open: { type: String, default: "09:00" },
        close: { type: String, default: "18:00" }
      },
      saturday: {
        isClosed: { type: Boolean, default: true },
        open: { type: String, default: "10:00" },
        close: { type: String, default: "16:00" }
      },
      sunday: {
        isClosed: { type: Boolean, default: true },
        open: { type: String },
        close: { type: String }
      }
    },

    // 🎉 Özel tatiller:
    customHolidays: [
      {
        date: { type: String, required: false }, // ISO date string örn: "2025-07-12"
        reason: { type: String }
      }
    ],

    createdAt: { type: Date, default: Date.now }
  }
);

const BeautyCenter = mongoose.model('BeautyCenter', beautyCenterSchema);

export default BeautyCenter;
