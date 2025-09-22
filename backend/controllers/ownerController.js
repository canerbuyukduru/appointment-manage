import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import generateToken from "../utils/createToken.js";
import asyncHandler from "../middleware/asyncHandler.js";
import Appointment from "../models/appoitmentsModel.js";
import BeautyCenter from "../models/beautyCentersModel.js";
import Department from "../models/departmentModel.js";
import Service from "../models/servicesModel.js";
import emailService from "../services/emailService.js";

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
      const isOldPasswordCorrect = await bcrypt.compare(
        oldPassword,
        owner.password
      );
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
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Owner profile update error:", error);
    res.status(500).json({
      message: "Profil güncellenirken bir hata oluştu",
      error: error.message,
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
        beautyCenter: beautyCenter || null,
      },
    });
  } catch (error) {
    console.error("Get owner profile error:", error);
    res.status(500).json({
      message: "Profil bilgileri alınırken bir hata oluştu",
      error: error.message,
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
// Randevu onaylama fonksiyonunu güncelle
export const ownerApproveAppointment = asyncHandler(async (req, res) => {
  const { notes } = req.body;
  
  const center = await getOwnerCenter(req.user._id);
  if (!center) {
    res.status(404);
    throw new Error("Beauty center not found");
  }

  const appt = await Appointment.findOne({
    _id: req.params.id,
    beautyCenterId: center._id,
  })
  .populate("userId", "fullName email phone")
  .populate("serviceId", "name duration price");

  if (!appt) {
    res.status(404);
    throw new Error("Appointment not found");
  }
  if (appt.status !== "pending") {
    res.status(400);
    throw new Error("Only pending appointments can be approved");
  }

  appt.status = "approved";
  if (notes) appt.notes = notes;
  await appt.save();

  // 📧 EMAIL GÖNDERİMİ
  try {
    if (appt.userId.email) {
      await emailService.sendAppointmentApproved(appt.userId.email, {
        customerName: appt.userId.fullName,
        centerName: center.name,
        serviceName: appt.serviceSnapshot?.name || appt.serviceId?.name,
        startDateTime: appt.startDateTime,
        centerPhone: center.phone,
        centerAddress: center.address
      });
    }
    console.log('📧 Appointment approval email sent');
  } catch (emailError) {
    console.error('📧 Email sending failed:', emailError);
  }

  res.json({ 
    message: "Appointment approved", 
    appointment: appt,
    emailSent: appt.userId.email ? true : false
  });
});
// Randevu reddetme fonksiyonunu güncelle
export const ownerRejectAppointment = asyncHandler(async (req, res) => {
  const { notes } = req.body;
  
  const center = await getOwnerCenter(req.user._id);
  if (!center) {
    res.status(404);
    throw new Error("Beauty center not found");
  }

  const appt = await Appointment.findOne({
    _id: req.params.id,
    beautyCenterId: center._id,
  })
  .populate("userId", "fullName email phone")
  .populate("serviceId", "name duration price");

  if (!appt) {
    res.status(404);
    throw new Error("Appointment not found");
  }
  if (!["pending", "approved"].includes(appt.status)) {
    res.status(400);
    throw new Error("This appointment cannot be rejected");
  }

  appt.status = "rejected";
  if (notes) appt.notes = notes;
  await appt.save();

  // 📧 EMAIL GÖNDERİMİ
  try {
    if (appt.userId.email) {
      await emailService.sendAppointmentRejected(appt.userId.email, {
        customerName: appt.userId.fullName,
        centerName: center.name,
        serviceName: appt.serviceSnapshot?.name || appt.serviceId?.name,
        startDateTime: appt.startDateTime,
        rejectionReason: notes
      });
    }
    console.log('📧 Appointment rejection email sent');
  } catch (emailError) {
    console.error('📧 Email sending failed:', emailError);
  }

  res.json({ 
    message: "Appointment rejected", 
    appointment: appt,
    emailSent: appt.userId.email ? true : false
  });
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

// Mevcut createAppointmentForCustomer fonksiyonunu güncelle:
export const createAppointmentForCustomer = asyncHandler(async (req, res) => {
  const { 
    customerEmail, 
    customerPhone, 
    customerFullName, 
    departmentId, 
    serviceId, 
    startDateTime,
    notes
  } = req.body;

  // Validasyon
  if (!departmentId || !serviceId || !startDateTime) {
    res.status(400);
    throw new Error("departmentId, serviceId ve startDateTime zorunludur.");
  }

  if (!customerEmail && !customerPhone) {
    res.status(400);
    throw new Error("Müşteri email veya telefon bilgisi zorunludur.");
  }

  // Owner'ın merkezini bul
  const center = await getOwnerCenter(req.user._id);
  if (!center) {
    res.status(404);
    throw new Error("Beauty center bulunamadı.");
  }

  // Departman ve hizmet kontrolü
  const dept = await Department.findById(departmentId);
  if (!dept) {
    res.status(404);
    throw new Error("Departman bulunamadı.");
  }

  const service = await Service.findById(serviceId);
  if (!service) {
    res.status(404);
    throw new Error("Hizmet bulunamadı.");
  }

  // Müşteriyi bul veya oluştur
  let customer = null;
  let customerCreated = false;
  let tempPassword = null;
  
  if (customerEmail) {
    customer = await User.findOne({ email: customerEmail });
  } else if (customerPhone) {
    customer = await User.findOne({ phone: customerPhone });
  }

  // Müşteri yoksa yeni hesap oluştur
  if (!customer) {
    tempPassword = Math.random().toString(36).slice(-8) + '!';
    customer = await User.create({
      fullName: customerFullName || "Müşteri",
      email: customerEmail || `customer_${Date.now()}@temp.com`,
      phone: customerPhone || "",
      password: tempPassword,
      role: "user"
    });
    
    customerCreated = true;
  }

  // Başlama/bitiş saatleri
  const start = new Date(startDateTime);
  const end = new Date(start.getTime() + service.duration * 60000);
  const beautyCenterId = center._id;

  // Çalışma saatleri kontrolü
  const weekday = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][start.getUTCDay()];
  const wh = center.workingHours?.[weekday];
  const dateStr = start.toISOString().slice(0,10);
  const isHoliday = (center.customHolidays || []).some(h => h.date === dateStr);

  if (!wh || wh.isClosed || isHoliday) {
    res.status(400);
    throw new Error("Seçilen gün merkez kapalı.");
  }

  const [openH, openM] = (wh.open || "09:00").split(":").map(Number);
  const [closeH, closeM] = (wh.close || "18:00").split(":").map(Number);

  const openDT = new Date(start); openDT.setUTCHours(openH, openM, 0, 0);
  const closeDT = new Date(start); closeDT.setUTCHours(closeH, closeM, 0, 0);

  if (start < openDT || end > closeDT) {
    res.status(400);
    throw new Error("Seçilen saat çalışma saatleri dışında.");
  }

  // Kapasite kontrolü
  const roomCount = dept.roomCount || 1;
  const overlapping = await Appointment.countDocuments({
    beautyCenterId, 
    departmentId,
    status: { $in: ["pending","approved"] },
    $expr: { 
      $and: [
        { $lt: ["$startDateTime", end] }, 
        { $gt: ["$endDateTime", start] }
      ] 
    }
  });

  if (overlapping >= roomCount) {
    res.status(400);
    throw new Error("Bu saat dolu.");
  }

  // Randevuyu oluştur (Owner tarafından oluşturulan randevular direkt onaylı)
  const appointment = await Appointment.create({
    userId: customer._id,
    beautyCenterId,
    departmentId,
    serviceId,
    startDateTime: start,
    endDateTime: end,
    status: "approved", // Owner oluşturduğu için direkt onaylı
    notes: notes || "",
    createdBy: req.user._id, // Hangi owner oluşturduğunu track etmek için
    serviceSnapshot: {
      name: service.name,
      duration: service.duration,
      price: service.price
    }
  });

  // Populate edilmiş randevu döndür
  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate("userId", "fullName email phone")
    .populate("departmentId", "name")
    .populate("serviceId", "name duration price");

  // 📧 EMAIL GÖNDERİMİ
  try {
    // 1. Yeni müşteri oluşturulduysa hesap bilgileri maili
    if (customerCreated && customerEmail && tempPassword) {
      await emailService.sendNewCustomerAccount(customerEmail, {
        customerName: customer.fullName,
        tempPassword: tempPassword,
        centerName: center.name
      });
    }

    // 2. Randevu onaylandı maili (Owner oluşturduğu için direkt onaylı)
    if (customerEmail) {
      await emailService.sendAppointmentApproved(customerEmail, {
        customerName: customer.fullName,
        centerName: center.name,
        serviceName: service.name,
        startDateTime: start,
        centerPhone: center.phone,
        centerAddress: center.address
      });
    }

    console.log('📧 Email notifications sent successfully');
  } catch (emailError) {
    console.error('📧 Email sending failed:', emailError);
    // Email hatası uygulamayı durdurmasın, sadece log'la
  }

  res.status(201).json({
    message: "Müşteri için randevu başarıyla oluşturuldu.",
    appointment: populatedAppointment,
    customerCreated: customerCreated,
    emailSent: customerEmail ? true : false
  });
});