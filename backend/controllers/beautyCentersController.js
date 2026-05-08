import asyncHandler from "../middleware/asyncHandler.js";
import BeautyCenter from "../models/beautyCentersModel.js";
import Departments from "../models/departmentModel.js";
// @desc    Create new Beauty Center
// @route   POST /api/beauty-centers
// @access  Private (owner only)

export const createBeautyCenter = asyncHandler(async (req, res) => {
  const {
    name,
    address,
    phone,
    email,
    description,
    location,
    workingHours,
    customHolidays,
  } = req.body;

  if (!name || !address || !phone) {
    res.status(400);
    throw new Error("isim, adres ve telefon numarası zorunludur");
  }

  const beautyCenter = new BeautyCenter({
    name,
    address,
    phone,
    email,
    description,
    location,
    workingHours,
    customHolidays,
    ownerId: req.user._id, // giriş yapan owner
    isApproved: false,    // admin onayına düşsün
  });

  const createdCenter = await beautyCenter.save();

  res.status(201).json({
    message: "Beauty center created successfully. Awaiting admin approval.",
    beautyCenter: createdCenter,
  });
});


// GET /api/beauty-centers/mine
// Owner kendi merkezini görür
export const getMyBeautyCenter = asyncHandler(async (req, res) => {
  const beautyCenter = await BeautyCenter.findOne({ ownerId: req.user._id });

  if (!beautyCenter) {
    res.status(404);
    throw new Error("Güzellik merkezi bulunamadı.");
  }

  res.json(beautyCenter);
});

// PUT /api/beauty-centers/mine
// Owner kendi merkezini günceller
export const updateMyBeautyCenter = asyncHandler(async (req, res) => {
  const beautyCenter = await BeautyCenter.findOne({ ownerId: req.user._id });

  if (!beautyCenter) {
    res.status(404);
    throw new Error("Güzellik merkezi bulunamadı.");
  }

  const ALLOWED = ['name', 'address', 'phone', 'email', 'description', 'location', 'workingHours', 'customHolidays'];
  ALLOWED.forEach((k) => {
    if (k in req.body) beautyCenter[k] = req.body[k];
  });

  const updatedCenter = await beautyCenter.save();
  res.json(updatedCenter);
});

export const getCenterDepartments = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const beautyCenter = await BeautyCenter.findById(id);
  const departments = await Departments.find({ beautyCenterId: id });
  if (!beautyCenter) {
    res.status(404);
    throw new Error("Beauty center not found.");
  }

  res.json(departments);
});

export const getAllBeautyCenters = asyncHandler(async (req, res) => {
  const { search, location } = req.query

  let query = { isApproved: true }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ]
  }

  if (location) {
    query.location = { $regex: location, $options: "i" }
  }

  const beautyCenters = await BeautyCenter.find(query)
  res.json(beautyCenters)
})