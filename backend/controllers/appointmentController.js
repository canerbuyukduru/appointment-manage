import Appointment from "../models/appoitmentsModel.js";
import Department from "../models/departmentModel.js";
import Service from "../models/servicesModel.js";

// 1. Randevu oluştur
export const createAppointment = async (req, res) => {
  try {
    const { beautyCenterId, departmentId, serviceId, date } = req.body;
    const userId = req.user._id;

    // Aynı gün içinde aynı departmandan randevu kontrolü
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Appointment.findOne({
      userId,
      departmentId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ["cancelled", "rejected"] }
    });

    if (existing) {
      return res.status(400).json({ message: "Bu departmandan aynı gün içinde zaten bir randevunuz var." });
    }

    const appointment = await Appointment.create({
      userId,
      beautyCenterId,
      departmentId,
      serviceId,
      date
    });

    res.status(201).json({ message: "Randevu oluşturuldu.", appointment });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
};

// 2. Kullanıcının randevularını getir
export const getAppointmentsByUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const appointments = await Appointment.find({ userId })
      .populate("beautyCenterId", "name")
      .populate("departmentId", "name")
      .populate("serviceId", "name duration");

    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
};

// 3. Randevu iptal et (24 saat kuralı ile)
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const appointment = await Appointment.findOne({ _id: id, userId });
    if (!appointment) {
      return res.status(404).json({ message: "Randevu bulunamadı." });
    }

    const now = new Date();
    const diffHours = (appointment.date - now) / (1000 * 60 * 60);

    if (diffHours < 24) {
      return res.status(400).json({ message: "Randevular yalnızca 24 saat öncesine kadar iptal edilebilir." });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.json({ message: "Randevu iptal edildi.", appointment });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
};
