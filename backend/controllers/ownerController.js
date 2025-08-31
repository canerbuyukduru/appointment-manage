import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import generateToken from "../utils/createToken.js";
import asyncHandler from "../middleware/asyncHandler.js";
import Appointment from "../models/appoitmentsModel.js";
import BeautyCenter from "../models/beautyCentersModel.js";

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

    res
      .status(201)
      .json({ message: "Owner kaydı başarıyla oluşturuldu.", owner });
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

// 📌 Owner Profile Update
export const updateOwnerProfile = asyncHandler(async (req, res) => {
  try {
    // 1. Giriş yapmış owner'ı bul (middleware'dan gelir)
    const owner = req.user;
    
    if (!owner) {
      res.status(404);
      throw new Error("Owner bulunamadı");
    }

    // 2. Sadece owner role'ü olan kullanıcılar güncelleyebilir
    if (owner.role !== "owner") {
      res.status(403);
      throw new Error("Bu işlem sadece owner'lar tarafından yapılabilir");
    }

    // 3. Güncellenecek alanları al
    const { fullName, phone, password, oldPassword } = req.body;

    // 4. Şifre değişikliği varsa, eski şifreyi kontrol et
    if (password) {
      if (!oldPassword) {
        res.status(400);
        throw new Error("Şifre değiştirmek için mevcut şifrenizi giriniz");
      }

      // Eski şifre kontrolü
      const isOldPasswordCorrect = await bcrypt.compare(oldPassword, owner.password);
      if (!isOldPasswordCorrect) {
        res.status(400);
        throw new Error("Mevcut şifreniz yanlış");
      }

      // Yeni şifreyi hashle
      const salt = await bcrypt.genSalt(10);
      owner.password = await bcrypt.hash(password, salt);
    }

    // 5. Diğer alanları güncelle (sadece gelen alanları)
    if (fullName !== undefined) owner.fullName = fullName;
    if (phone !== undefined) owner.phone = phone;

    // 6. Veritabanına kaydet
    await owner.save();

    // 7. Güncellenmiş bilgileri döndür (şifre hariç)
    res.json({
      success: true,
      message: "Profil başarıyla güncellendi",
      owner: {
        _id: owner._id,
        fullName: owner.fullName,
        email: owner.email, // Email değiştirilemez
        phone: owner.phone,
        role: owner.role,
        isApproved: owner.isApproved,
        updatedAt: new Date()
      }
    });

  } catch (error) {
    console.error("Owner profile update error:", error);
    res.status(500).json({ 
      message: "Profil güncellenirken bir hata oluştu", 
      error: error.message 
    });
  }
});

// 📌 Owner'ın mevcut profilini getiren fonksiyon
export const getOwnerProfile = asyncHandler(async (req, res) => {
  try {
    // Giriş yapmış owner'ı bul
    const owner = req.user;
    
    if (!owner) {
      res.status(404);
      throw new Error("Owner bulunamadı");
    }

    if (owner.role !== "owner") {
      res.status(403);
      throw new Error("Bu işlem sadece owner'lar tarafından yapılabilir");
    }

    // Owner'ın beauty center bilgisini de getir
    const beautyCenter = await BeautyCenter.findOne({ ownerId: owner._id });

    res.json({
      success: true,
      owner: {
        _id: owner._id,
        fullName: owner.fullName,
        email: owner.email,
        phone: owner.phone,
        role: owner.role,
        isApproved: owner.isApproved,
        isBanned: owner.isBanned,
        createdAt: owner.createdAt,
        beautyCenter: beautyCenter || null
      }
    });

  } catch (error) {
    console.error("Get owner profile error:", error);
    res.status(500).json({ 
      message: "Profil bilgileri alınırken bir hata oluştu", 
      error: error.message 
    });
  }
});

export const getOwnerAppointments = asyncHandler(async (req, res) => {
  const { status, date } = req.query; // Query parametrelerini al

  // 1) Önce bu owner'ın merkezini bul
  const center = await BeautyCenter.findOne({ ownerId: req.user._id });
  if (!center) {
    res.status(404);
    throw new Error("Beauty center not found for this owner");
  }

  // 2) Filter objesi oluştur
  const filter = { beautyCenterId: center._id };

  // Status filtresi
  if (status && status !== "all") {
    filter.status = status;
  }

  // Tarih filtresi (belirtilen tarih için)
  if (date) {
    const selectedDate = new Date(date);
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    filter.startDateTime = {
      $gte: selectedDate,
      $lt: nextDay,
    };
  }

  // 3) Filtrelenmiş randevuları getir
  const appointments = await Appointment.find(filter)
    .populate("userId", "fullName email phone role")
    .populate("beautyCenterId", "name address location phone")
    .populate("departmentId", "name")
    .populate("serviceId", "name duration price")
    .sort({ startDateTime: 1 }); // Tarihe göre sırala

  res.json({ appointments });
});

const getOwnerCenter = async (ownerId) => {
  return await BeautyCenter.findOne({ ownerId });
};

// kullanılmıyor
export const ownerApproveAppointment = asyncHandler(async (req, res) => {
  const center = await getOwnerCenter(req.user._id);
  if (!center) {
    res.status(404);
    throw new Error("Beauty center not found");
  }

  const appt = await Appointment.findOne({
    _id: req.params.id,
    beautyCenterId: center._id,
  });
  if (!appt) {
    res.status(404);
    throw new Error("Appointment not found");
  }
  if (appt.status !== "pending") {
    res.status(400);
    throw new Error("Only pending appointments can be approved");
  }

  appt.status = "approved";
  await appt.save();

  res.json({ message: "Appointment approved", appointment: appt });
});
export const ownerRejectAppointment = asyncHandler(async (req, res) => {
  const center = await getOwnerCenter(req.user._id);
  if (!center) {
    res.status(404);
    throw new Error("Beauty center not found");
  }

  const appt = await Appointment.findOne({
    _id: req.params.id,
    beautyCenterId: center._id,
  });
  if (!appt) {
    res.status(404);
    throw new Error("Appointment not found");
  }
  if (!["pending", "approved"].includes(appt.status)) {
    res.status(400);
    throw new Error("This appointment cannot be rejected");
  }

  appt.status = "rejected";
  await appt.save();

  res.json({ message: "Appointment rejected", appointment: appt });
});

export const ownerMarkAttendance = asyncHandler(async (req, res) => {
  const { attended } = req.body;

  if (typeof attended !== "boolean") {
    res.status(400);
    throw new Error("attended boolean olmalı (true/false).");
  }

  const center = await getOwnerCenter(req.user._id);
  if (!center) {
    res.status(404);
    throw new Error("Beauty center bulunamadı.");
  }

  // Randevu sadece bu merkeze aitse bulunur
  const appt = await Appointment.findOne({
    _id: req.params.id,
    beautyCenterId: center._id,
  });

  if (!appt) {
    res.status(404);
    throw new Error("Randevu bulunamadı.");
  }

  // Yalnızca onaylı (veya daha önce işaretlenmiş) randevular işaretlenebilir
  if (!["approved", "completed", "no-show"].includes(appt.status)) {
    res.status(400);
    throw new Error(
      "Sadece onaylı veya daha önce işaretlenmiş randevular güncellenebilir."
    );
  }

  // Gelecek zaman kısıtı (en azından randevu başlamış olmalı)
  const now = new Date();
  if (appt.startDateTime > now) {
    res.status(400);
    throw new Error("Randevu başlamadan attendance işaretlenemez.");
  }
  // İstersen daha sıkı: if (appt.endDateTime > now) { throw new Error("Randevu bitmeden işaretlenemez."); }

  appt.attended = attended;
  appt.status = attended ? "completed" : "no-show";

  await appt.save();

  res.json({
    message: attended
      ? "Randevu tamamlandı olarak işaretlendi."
      : "Randevu no-show olarak işaretlendi.",
    appointment: appt,
  });
});
// kullanılmıyor

export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  // Owner'ın bu randevuyu güncelleyebilir mi kontrol et
  const center = await BeautyCenter.findOne({ ownerId: req.user._id });
  if (!center) {
    res.status(404);
    throw new Error("Beauty center not found");
  }

  const appointment = await Appointment.findOne({
    _id: id,
    beautyCenterId: center._id,
  });

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  appointment.status = status;
  if (notes) {
    appointment.notes = notes; // Eğer appointment modelinizde notes field'ı varsa
  }

  await appointment.save();

  res.json({
    success: true,
    message: "Appointment status updated",
    appointment,
  });
});
