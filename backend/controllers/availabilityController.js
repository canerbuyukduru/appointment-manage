// controllers/availabilityController.js
import asyncHandler from "../middleware/asyncHandler.js";
import BeautyCenter from "../models/beautyCentersModel.js";
import Appointment from "../models/appoitmentsModel.js";
import Service from "../models/servicesModel.js";
import dayjs from "dayjs";

export const getAvailability = asyncHandler(async (req, res) => {
  const { beautyCenterId, departmentId, serviceId, date } = req.query;

  if (!beautyCenterId || !date) {
    return res.status(400).json({ message: "beautyCenterId ve date zorunlu" });
  }

  const center = await BeautyCenter.findById(beautyCenterId);
  if (!center) return res.status(404).json({ message: "Beauty center bulunamadı" });

  // Tatil mi?
  const isHoliday = center.customHolidays?.some(h => h.date === date);
  if (isHoliday) {
    return res.json({ slots: [], message: "Seçilen gün tatil" });
  }

  // Çalışma saatleri
  const dayName = dayjs(date).format("dddd").toLowerCase(); // monday, tuesday ...
  const workDay = center.workingHours[dayName];
  if (!workDay || workDay.isClosed) {
    return res.json({ slots: [], message: "Seçilen gün kapalı" });
  }

  const open = dayjs(`${date} ${workDay.open}`);
  const close = dayjs(`${date} ${workDay.close}`);

  // Slot uzunluğu
  let slotDuration = 30; // default 30dk
  if (serviceId) {
    const service = await Service.findById(serviceId);
    if (service) slotDuration = service.duration || 30;
  }

  // O gün alınan randevular
  const appointments = await Appointment.find({
    beautyCenterId,
    departmentId: departmentId || { $exists: true },
    status: { $in: ["pending", "approved"] },
    startDateTime: { $gte: open.toDate(), $lt: close.toDate() },
  });

  // Slot üret
  const slots = [];
  let cursor = open;
  while (cursor.add(slotDuration, "minute").isBefore(close) || cursor.add(slotDuration, "minute").isSame(close)) {
    const slotStart = cursor;
    const slotEnd = cursor.add(slotDuration, "minute");

    const overlap = appointments.some(a => {
      const aStart = dayjs(a.startDateTime);
      const aEnd = dayjs(a.endDateTime);
      return slotStart.isBefore(aEnd) && slotEnd.isAfter(aStart);
    });

    if (!overlap) {
      slots.push(slotStart.format("HH:mm"));
    }
    cursor = slotEnd;
  }

  res.json({ slots });
});
