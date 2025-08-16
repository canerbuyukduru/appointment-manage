import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import generateToken from "../utils/createToken.js";

// 📌 Owner Register
export const registerOwner = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // 1. Email zaten var mı kontrol
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Bu email zaten kayıtlı." });
    }

    // 2. Şifre hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Owner olarak kullanıcı oluştur
    const owner = new User({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role: "owner", // 🔑 burada rolü belirtiyoruz
    });

    await owner.save();

    res.status(201).json({ message: "Owner kaydı başarıyla oluşturuldu.", owner });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
};

// 📌 Owner Login
export const loginOwner = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Owner var mı kontrol et
    const owner = await User.findOne({ email, role: "owner" });
    if (!owner) {
      return res.status(400).json({ message: "Owner bulunamadı." });
    }

    // Şifre kontrolü
    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Geçersiz şifre." });
    }

    // Token oluşturup cookie olarak set et
    generateToken(res, owner._id);

    res.status(200).json({
      message: "Login başarılı",
      owner: {
        id: owner._id,
        fullName: owner.fullName,
        email: owner.email,
        phone: owner.phone,
        role: owner.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
};

export const logoutOwner = async (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0), // geçmiş bir tarih veriyoruz
    });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
