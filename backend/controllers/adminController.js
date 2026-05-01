// controllers/adminController.js
import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/userModel.js";
import BeautyCenter from "../models/beautyCentersModel.js";
import Appointment from "../models/appoitmentsModel.js";
import generateToken from "../utils/createToken.js";
import bcrypt from "bcryptjs";

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalOwners,
    pendingOwners,
    approvedOwners,
    totalCenters,
    totalAppointments,
    todayAppointments,
    bannedUsers,
  ] = await Promise.all([
    User.countDocuments({ role: { $ne: "admin" } }),
    User.countDocuments({ role: "owner" }),
    User.countDocuments({ role: "owner", isApproved: false }),
    User.countDocuments({ role: "owner", isApproved: true }),
    BeautyCenter.countDocuments(),
    Appointment.countDocuments(),
    Appointment.countDocuments({
      startDateTime: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lt: new Date().setHours(23, 59, 59, 999),
      },
    }),
    User.countDocuments({ isBanned: true }),
  ]);

  // Son 7 günün randevu istatistikleri
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const appointmentCount = await Appointment.countDocuments({
      startDateTime: { $gte: startOfDay, $lte: endOfDay },
    });

    last7Days.push({
      date: startOfDay.toISOString().split("T")[0],
      appointments: appointmentCount,
    });
  }

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalOwners,
      pendingOwners,
      approvedOwners,
      totalCenters,
      totalAppointments,
      todayAppointments,
      bannedUsers,
      last7Days,
    },
  });
});

// @desc    Get all pending owners
// @route   GET /api/admin/owners/pending
// @access  Private/Admin
export const getPendingOwners = asyncHandler(async (req, res) => {
  const pendingOwners = await User.find({
    role: "owner",
    isApproved: false,
    isBanned: false,
  })
    .select("-password")
    .sort({ createdAt: -1 });

  // Her owner için beauty center bilgisini de al
  const ownersWithCenters = await Promise.all(
    pendingOwners.map(async (owner) => {
      const center = await BeautyCenter.findOne({ ownerId: owner._id });
      return {
        ...owner.toObject(),
        beautyCenter: center,
      };
    })
  );

  res.json({
    success: true,
    owners: ownersWithCenters,
  });
});

export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email ve şifre zorunludur");
  }

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

  generateToken(res, admin._id);
  res.json({
    message: "Giriş başarılı",
    user: {
      _id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      phone: admin.phone,
      role: admin.role,
    },
  });
});

export const logoutAdmin = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.json({ message: "Çıkış yapıldı" });
});

// @desc    Get all owners (approved, pending, rejected)
// @route   GET /api/admin/owners
// @access  Private/Admin
export const getAllOwners = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10, search } = req.query;

  const filter = { role: "owner" };

  // Status filtresi
  if (status === "pending") {
    filter.isApproved = false;
    filter.isBanned = false;
  } else if (status === "approved") {
    filter.isApproved = true;
    filter.isBanned = false;
  } else if (status === "banned") {
    filter.isBanned = true;
  }

  // Search filtresi
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [owners, totalCount] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(filter),
  ]);

  // Her owner için beauty center bilgisini de al
  const ownersWithCenters = await Promise.all(
    owners.map(async (owner) => {
      const center = await BeautyCenter.findOne({ ownerId: owner._id });
      return {
        ...owner.toObject(),
        beautyCenter: center,
      };
    })
  );

  res.json({
    success: true,
    owners: ownersWithCenters,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      hasNext: page * limit < totalCount,
      hasPrev: page > 1,
    },
  });
});

// @desc    Get owner details
// @route   GET /api/admin/owners/:id
// @access  Private/Admin
export const getOwnerDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const owner = await User.findOne({ _id: id, role: "owner" }).select(
    "-password"
  );

  if (!owner) {
    res.status(404);
    throw new Error("İşletme Sahibi bulunamadı.");
  }

  // Beauty center bilgilerini al
  const beautyCenter = await BeautyCenter.findOne({ ownerId: id }).populate(
    "ownerId",
    "fullName email phone"
  );

  // Owner'ın randevu istatistiklerini al
  let appointmentStats = null;
  if (beautyCenter) {
    const [totalAppointments, pendingAppointments, thisMonthAppointments] =
      await Promise.all([
        Appointment.countDocuments({ beautyCenterId: beautyCenter._id }),
        Appointment.countDocuments({
          beautyCenterId: beautyCenter._id,
          status: "pending",
        }),
        Appointment.countDocuments({
          beautyCenterId: beautyCenter._id,
          startDateTime: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            $lt: new Date(
              new Date().getFullYear(),
              new Date().getMonth() + 1,
              1
            ),
          },
        }),
      ]);

    appointmentStats = {
      total: totalAppointments,
      pending: pendingAppointments,
      thisMonth: thisMonthAppointments,
    };
  }

  res.json({
    success: true,
    owner: {
      ...owner.toObject(),
      beautyCenter,
      appointmentStats,
    },
  });
});

// @desc    Approve owner
// @route   PATCH /api/admin/owners/:id/approve
// @access  Private/Admin
export const approveOwner = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const owner = await User.findOne({ _id: id, role: "owner" });

  if (!owner) {
    res.status(404);
    throw new Error("İşletme Sahibi bulunamadı.");
  }

  if (owner.isApproved) {
    const beautyCenter = await BeautyCenter.findOne({ ownerId: id });
    if (beautyCenter) {
      beautyCenter.isApproved = true;
      await beautyCenter.save();
    } else {
      res.status(400);
      throw new Error("İşletme Sahibi zaten onaylanmış.");
    }
  }

  // Owner'ı onayla
  owner.isApproved = true;
  await owner.save();

  // Beauty center'ı da onayla (eğer varsa)
  const beautyCenter = await BeautyCenter.findOne({ ownerId: id });
  if (beautyCenter) {
    beautyCenter.isApproved = true;
    await beautyCenter.save();
  }

  // TODO: Owner'a email bildirimi gönder
  // await sendOwnerApprovalEmail(owner.email, { approved: true, notes });

  res.json({
    success: true,
    message: "İşletme Sahibi başarıyla onaylandı.",
    owner: {
      id: owner._id,
      fullName: owner.fullName,
      email: owner.email,
      isApproved: owner.isApproved,
      approvedAt: new Date(),
    },
  });
});

// @desc    Reject owner
// @route   PATCH /api/admin/owners/:id/reject
// @access  Private/Admin
export const rejectOwner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason || reason.trim().length === 0) {
    res.status(400);
    throw new Error("Reddetme nedeni gerekli");
  }

  const owner = await User.findOne({ _id: id, role: "owner" });

  if (!owner) {
    res.status(404);
    throw new Error("İşletme Sahibi bulunamadı.");
  }

  if (owner.isApproved) {
    res.status(400);
    throw new Error("Onaylanmış bir işletme sahibi reddedilemez. Önce onayı kaldırın.");
  }

  // Owner'ı ban'le (rejected olarak işaretlemek için)
  owner.isBanned = true;
  await owner.save();

  // Beauty center'ı da reject et
  const beautyCenter = await BeautyCenter.findOne({ ownerId: id });
  if (beautyCenter) {
    beautyCenter.isApproved = false;
    await beautyCenter.save();
  }

  // TODO: Owner'a email bildirimi gönder
  // await sendOwnerApprovalEmail(owner.email, { approved: false, reason });

  res.json({
    success: true,
    message: "İşletme Sahibi başarıyla reddedildi.",
    owner: {
      id: owner._id,
      fullName: owner.fullName,
      email: owner.email,
      isApproved: owner.isApproved,
      isBanned: owner.isBanned,
      rejectedAt: new Date(),
      rejectionReason: reason,
    },
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, status, page = 1, limit = 10, search } = req.query;

  const filter = {};

  // Role filtresi
  if (role && role !== "all") {
    filter.role = role;
  } else {
    filter.role = { $ne: "admin" }; // Admin'leri gösterme
  }

  // Status filtresi
  if (status === "banned") {
    filter.isBanned = true;
  } else if (status === "active") {
    filter.isBanned = false;
  }

  // Search filtresi
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [users, totalCount] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    users,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      hasNext: page * limit < totalCount,
      hasPrev: page > 1,
    },
  });
});

// @desc    Ban/Unban user
// @route   PATCH /api/admin/users/:id/ban
// @access  Private/Admin
export const toggleUserBan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason, action } = req.body; // action: 'ban' or 'unban'

  const user = await User.findById(id);

  if (!user) {
    res.status(404);
    throw new Error("Kullanıcı bulunamadı");
  }

  if (user.role === "admin") {
    res.status(403);
    throw new Error("Admin kullanıcılar yasaklanamaz");
  }

  if (action === "ban") {
    if (!reason || reason.trim().length === 0) {
      res.status(400);
      throw new Error("Yasaklama nedeni gerekli");
    }

    user.isBanned = true;

    // TODO: User'a email bildirimi gönder
    // await sendBanNotificationEmail(user.email, reason);
  } else if (action === "unban") {
    user.isBanned = false;

    // TODO: User'a email bildirimi gönder
    // await sendUnbanNotificationEmail(user.email);
  } else {
    res.status(400);
    throw new Error('Geçersiz işlem. "ban" veya "unban" kullanın');
  }

  await user.save();

  res.json({
    success: true,
    message: `Kullanıcı başarıyla ${action === "ban" ? "yasaklandı" : "yasaklaması kaldırıldı"}`,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isBanned: user.isBanned,
      updatedAt: new Date(),
    },
  });
});

// @desc    Get all beauty centers
// @route   GET /api/admin/beauty-centers
// @access  Private/Admin
export const getAllBeautyCenters = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10, search } = req.query;

  const filter = {};

  // Status filtresi
  if (status === "approved") {
    filter.isApproved = true;
  } else if (status === "pending") {
    filter.isApproved = false;
  }

  // Search filtresi
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { address: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [centers, totalCount] = await Promise.all([
    BeautyCenter.find(filter)
      .populate("ownerId", "fullName email phone isApproved isBanned")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    BeautyCenter.countDocuments(filter),
  ]);

  res.json({
    success: true,
    centers,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      hasNext: page * limit < totalCount,
      hasPrev: page > 1,
    },
  });
});

// @desc    Suspend/Activate beauty center
// @route   PATCH /api/admin/beauty-centers/:id/toggle-status
// @access  Private/Admin
export const toggleBeautyCenterStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action, reason } = req.body; // action: 'suspend' or 'activate'

  const center = await BeautyCenter.findById(id).populate(
    "ownerId",
    "fullName email"
  );

  if (!center) {
    res.status(404);
    throw new Error("İşletme centerı bulunamadı");
  }

  if (action === "suspend") {
    if (!reason || reason.trim().length === 0) {
      res.status(400);
      throw new Error("Askıya alma nedeni gerekli");
    }

    center.isApproved = false;

    // TODO: Owner'a email bildirimi gönder
    // await sendSuspensionEmail(center.ownerId.email, center.name, reason);
  } else if (action === "activate") {
    center.isApproved = true;

    // TODO: Owner'a email bildirimi gönder
    // await sendActivationEmail(center.ownerId.email, center.name);
  } else {
    res.status(400);
    throw new Error('Geçersiz işlem. "suspend" veya "activate" kullanın');
  }

  await center.save();

  res.json({
    success: true,
    message: `Beauty center ${
      action === "suspend" ? "askıya alındı" : "etkinleştirildi"
    } successfully`,
    center: {
      id: center._id,
      name: center.name,
      isApproved: center.isApproved,
      owner: center.ownerId,
      updatedAt: new Date(),
    },
  });
});
