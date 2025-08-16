import Department from "../models/departmentModel.js";
import BeautyCenter from "../models/beautyCentersModel.js";
import asyncHandler from "../middleware/asyncHandler.js";

// Departman oluştur
// POST /api/departments
// onlyOwner
const createDepartment = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  // Beauty center ID'yi auth olmuş owner'dan alıyoruz
  const beautyCenter = await BeautyCenter.findOne({ ownerId: req.user._id });

  if (!beautyCenter) {
    res.status(404);
    throw new Error("Beauty center not found for this owner.");
  }

  const department = await Department.create({
    name,
    description,
    beautyCenterId: beautyCenter._id,
  });

  res.status(201).json({
    message: "Department created successfully",
    department,
  });
});

const getDepartments = asyncHandler(async (req, res) => {
  const beautyCenter = await BeautyCenter.findOne({ ownerId: req.user._id });

  if (!beautyCenter) {
    return res.status(404).json({ message: "Beauty center not found" });
  }

  const departments = await Department.find({ beautyCenterId: beautyCenter._id });
  res.json(departments);
});


const updateDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params; // Güncellenecek departman id
  const updates = req.body;

  // Owner’ın güzellik merkezini bul
  const beautyCenter = await BeautyCenter.findOne({ ownerId: req.user._id });
  if (!beautyCenter) {
    return res.status(404).json({ message: "Beauty center not found" });
  }

  // Departman gerçekten bu beauty center’a mı ait kontrol et
  const department = await Department.findOne({
    _id: id,
    beautyCenterId: beautyCenter._id,
  });

  if (!department) {
    return res.status(404).json({ message: "Department not found" });
  }

  // Güncelleme işlemi
  Object.keys(updates).forEach((key) => {
    department[key] = updates[key];
  });

  await department.save();

  res.json({ message: "Department updated successfully", department });
});


const deleteDepartment = asyncHandler(async (req, res) => {

   const { id } = req.params;

  const department = await Department.findByIdAndDelete(id);

  if (!department) {
    res.status(404);
    throw new Error("Department not found");
  }

  res.json({ message: "Department deleted successfully" });
});

export { createDepartment, getDepartments, updateDepartment, deleteDepartment };
