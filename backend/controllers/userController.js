import bcrypt from "bcryptjs";
import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/userModel.js";
import generateToken from "../utils/createToken.js";
import BeautyCenter from "../models/beautyCentersModel.js";

// POST /api/users/register
// Public
export const registerUser = asyncHandler(async (req, res) => {
  let { fullName, email, password, phone } = req.body;

  if (!fullName || !email || !password || !phone) {
    res.status(400);
    throw new Error("fullName, email, password, phone zorunludur");
  }

  email = email.toLowerCase();

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error("Bu email zaten kayıtlı");
  }

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  const user = await User.create({
    fullName,
    email,
    password: hashed,     // modelde alan adı 'password'
    phone,
    role: "user"          // müşteri olarak aç
  });

  // Login olmuş gibi cookie’ye token bas (opsiyonel ama genelde iyi UX)
  generateToken(res, user._id);

  res.status(201).json({
    _id: user._id,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  });
});

// POST /api/users/login
// Public
export const loginUser = asyncHandler(async (req, res) => {
  let { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("email ve password zorunludur");
  }

  email = email.toLowerCase();

  const user = await User.findOne({ email, role: "user" });
  if (!user) {
    res.status(401);
    throw new Error("Geçersiz kimlik bilgileri");
  }

  if (user.isBanned) {
    res.status(403);
    throw new Error("Hesabınız engellenmiştir");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    res.status(401);
    throw new Error("Geçersiz kimlik bilgileri");
  }

  // Cookie'ye JWT yaz
  generateToken(res, user._id);

  res.json({
    message: "Giriş başarılı",
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
});

// POST /api/users/logout
// Private (ama istersen public da yapabilirsin)
export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.json({ message: "Çıkış yapıldı" });
});

// GET /api/users/profile
// Private
export const getMyProfile = asyncHandler(async (req, res) => {
  // authenticate middleware: req.user = user ( -password ile )
  res.json(req.user);
});

// PUT /api/users/profile
// Private
export const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("Kullanıcı bulunamadı");
  }

  // sadece gelen alanları güncelle
  const { fullName, phone, password } = req.body;
  if (fullName !== undefined) user.fullName = fullName;
  if (phone !== undefined) user.phone = phone;

  if (password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
  }

  await user.save();

  res.json({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
  });
});

export const getAllBeautyCenters = asyncHandler(async (req, res) => {
  const { search, location } = req.query

  let query = {}

  // 🔎 Arama filtresi (name veya description içinde arama)
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ]
  }
// location için
if (location) {
  query.location = { $regex: location, $options: "i" }
}

  const beautyCenters = await BeautyCenter.find(query)
  res.json(beautyCenters)
})