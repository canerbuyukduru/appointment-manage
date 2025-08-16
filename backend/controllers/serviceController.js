import asyncHandler from "../middleware/asyncHandler.js";
import Service from "../models/servicesModel.js";
import Department from "../models/departmentModel.js";

// Yeni Service oluşturma
const createService = asyncHandler(async (req, res) => {
  const { departmentId, name, description, duration, price } = req.body;

  const department = await Department.findById(departmentId);
  if (!department) {
    res.status(404);
    throw new Error("Department not found");
  }

  const service = new Service({
    departmentId,
    name,
    description,
    duration,
    price,
  });

  const createdService = await service.save();
  res.status(201).json(createdService);
});

// Service güncelleme
const updateService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const service = await Service.findById(id);
  if (!service) {
    res.status(404);
    throw new Error("Service not found");
  }

  Object.keys(updates).forEach((key) => {
    service[key] = updates[key];
  });

  const updatedService = await service.save();
  res.json(updatedService);
});

// Service silme
const deleteService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const service = await Service.findByIdAndDelete(id);

  if (!service) {
    res.status(404);
    throw new Error("Service not found");
  }

  res.json({ message: "Service deleted successfully" });
});

export { createService, updateService, deleteService };
