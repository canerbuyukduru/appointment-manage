import asyncHandler from "../middleware/asyncHandler.js";
import Appointment from "../models/appoitmentsModel.js";
import BeautyCenter from "../models/beautyCentersModel.js";
import Department from "../models/departmentModel.js";
import Service from "../models/servicesModel.js";



// zaman çakışması (overlap) için yardımcı query parçası
const overlapsQuery = (start, end) => ({
  $expr: { $and: [{ $lt: ["$startDateTime", end] }, { $gt: ["$endDateTime", start] }] }
});

// POST /api/appointments
// body: { beautyCenterId, departmentId, serviceId, startDateTime }
export const createAppointment = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { beautyCenterId, departmentId, serviceId, startDateTime } = req.body;

  if (!beautyCenterId || !departmentId || !serviceId || !startDateTime) {
    res.status(400);
    throw new Error("beautyCenterId, departmentId, serviceId ve startDateTime zorunludur.");
  }

  // temel veriler
  const center = await BeautyCenter.findById(beautyCenterId);
  console.log(center.isApproved)
  if (!center || !center.isApproved) {
    res.status(400);
    throw new Error("Merkez bulunamadı veya henüz onaylı değil.");
  }

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

  // başlama/bitiş saatleri (service süresine göre)
  const start = new Date(startDateTime);
  const end = new Date(start.getTime() + service.duration * 60000);

  // aynı gün aynı departmandan tek randevu kuralı
  const dayStart = new Date(start); dayStart.setUTCHours(0,0,0,0);
  const dayEnd   = new Date(start); dayEnd.setUTCHours(23,59,59,999);

  const already = await Appointment.findOne({
    userId,
    departmentId,
    startDateTime: { $gte: dayStart, $lte: dayEnd },
    status: { $in: ["pending","approved"] }
  });
  if (already) {
    res.status(400);
    throw new Error("Aynı gün bu departmandan zaten randevunuz var.");
  }

  // çalışma saatleri & tatil kontrolü
  const dateStr = start.toISOString().slice(0,10); // YYYY-MM-DD
  const weekday = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][start.getUTCDay()];
  const wh = center.workingHours?.[weekday];
  const isHoliday = (center.customHolidays || []).some(h => h.date === dateStr);

  if (!wh || wh.isClosed || isHoliday) {
    res.status(400);
    throw new Error("Seçilen gün merkez kapalı.");
  }

  const [openH, openM]   = (wh.open || "09:00").split(":").map(Number);
  const [closeH, closeM] = (wh.close || "18:00").split(":").map(Number);

  const openDT  = new Date(start);  openDT.setUTCHours(openH, openM, 0, 0);
  const closeDT = new Date(start); closeDT.setUTCHours(closeH, closeM, 0, 0);

  if (start < openDT || end > closeDT) {
    res.status(400);
    throw new Error("Seçilen saat çalışma saatleri dışında.");
  }

  // departman kapasitesi (oda sayısı) ve zaman çakışması
  const roomCount = dept.roomCount || 1;

  const overlapping = await Appointment.countDocuments({
    beautyCenterId, departmentId,
    status: { $in: ["pending","approved"] },
    ...overlapsQuery(start, end)
  });

  if (overlapping >= roomCount) {
    res.status(400);
    throw new Error("Bu saat dolu.");
  }

  // randevuyu oluştur
  const appointment = await Appointment.create({
    userId,
    beautyCenterId,
    departmentId,
    serviceId,
    startDateTime: start,
    endDateTime: end,
    status: "pending",
    serviceSnapshot: {
      name: service.name,
      duration: service.duration,
      price: service.price
    }
  });

  res.status(201).json({
    message: "Randevunuz oluşturuldu, onay bekleniyor.",
    appointment
  });
});

export const getMyAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ userId: req.user._id })
    .populate("beautyCenterId", "name address")
    .populate("departmentId", "name")
    .populate("serviceId", "name duration price");

  res.json(appointments);
});


const DAYS = 30;

export const cancelAppointment = asyncHandler(async (req, res) => {
  const app = await Appointment.findById(req.params.id);
  if (!app) { res.status(404); throw new Error("Randevu bulunamadı"); }
  if (app.userId.toString() !== req.user._id.toString()) {
    res.status(401); throw new Error("Yetkiniz yok");
  }
  if (!["pending","approved"].includes(app.status)) {
    res.status(400); throw new Error("Bu randevu iptal edilemez");
  }

  app.status = "cancelled";
  app.cancelledAt = new Date();
  app.expireAt = new Date(Date.now() + DAYS * 24 * 60 * 60 * 1000); // 30 gün sonra sil

  await app.save();
  res.json({ message: "Randevu iptal edildi", appointment: app });
});