import asyncHandler from "../middleware/asyncHandler.js";
import BeautyCenter from "../models/beautyCentersModel.js";
import User from "../models/userModel.js";
import generateToken from "../utils/createToken.js";
import bcrypt from "bcryptjs";

// GET /api/admin/owners
// Admin: get all owners
export const getAllOwners = asyncHandler(async (req, res) => {
  // query: ?page=1&limit=20&includeCenters=1
  const page  = Math.max(1, Number(req.query.page)  || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20);
  const skip  = (page - 1) * limit;
  const includeCenters = req.query.includeCenters === "1";

  const pipeline = [
    { $match: { role: "owner" } },
    { $sort: { createdAt: -1 } },      // 👈 owner oluşturulma tarihine göre (yeni → eski)
    { $skip: skip },
    { $limit: limit },
    // centers’ı opsiyonel ekle
    ...(includeCenters ? [{
      $lookup: {
        from: "beautycenters",          // Atlas’taki gerçek koleksiyon adı
        localField: "_id",
        foreignField: "ownerId",
        as: "centers",
        pipeline: [
          { $project: { name: 1, isApproved: 1, address: 1, createdAt: 1 } },
          { $sort: { createdAt: -1 } }  // merkezleri de kendi içinde yeni → eski sırala
        ]
      }
    }] : []),
    { $project: { password: 0 } }       // güvenlik
  ];

  const [owners, total] = await Promise.all([
    User.aggregate(pipeline),
    User.countDocuments({ role: "owner" })
  ]);

  res.json({
    page, limit, total,
    owners
  });
});

export const adminLogin = asyncHandler(async (req, res) => {
  let { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("email ve password zorunludur");
  }

  email = email.toLowerCase();

  // Sadece admin’leri ara
  const admin = await User.findOne({ email, role: "admin" });
  if (!admin) {
    res.status(401);
    throw new Error("Geçersiz kimlik bilgileri");
  }

  const match = await bcrypt.compare(password, admin.password);
  if (!match) {
    res.status(401);
    throw new Error("Geçersiz kimlik bilgileri");
  }

  // cookie'ye JWT yaz
  generateToken(res, admin._id);

  res.json({
    message: "Admin login başarılı",
    user: {
      _id: admin._id,
      full_name: admin.full_name,
      email: admin.email,
      phone: admin.phone,
      role: admin.role,
    },
  });
});