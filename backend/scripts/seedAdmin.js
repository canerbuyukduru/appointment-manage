import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@beautybook.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin123!";
const ADMIN_NAME = "Admin";
const ADMIN_PHONE = "05000000000";

async function seedAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB bağlandı.");

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log(`Admin zaten mevcut: ${ADMIN_EMAIL}`);
    await mongoose.disconnect();
    return;
  }

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await User.create({
    fullName: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: hashed,
    phone: ADMIN_PHONE,
    role: "admin",
    isApproved: true,
    isBanned: false,
  });

  console.log(`Admin oluşturuldu → ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  await mongoose.disconnect();
}

seedAdmin().catch((e) => { console.error(e); process.exit(1); });
