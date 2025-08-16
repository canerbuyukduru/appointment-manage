import asyncHandler from "../middleware/asyncHandler.js";
import BeautyCenter from "../models/beautyCentersModel.js";
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
    throw new Error("Name, address and phone are required");
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
    throw new Error("Beauty center not found.");
  }

  res.json(beautyCenter);
});

// PUT /api/beauty-centers/mine
// Owner kendi merkezini günceller
export const updateMyBeautyCenter = asyncHandler(async (req, res) => {
  const beautyCenter = await BeautyCenter.findOne({ ownerId: req.user._id });

  if (!beautyCenter) {
    res.status(404);
    throw new Error("Beauty center not found.");
  }

  // sadece gelen alanları güncelle
  const updates = req.body;
  Object.keys(updates).forEach((key) => {
    beautyCenter[key] = updates[key];
  });

  const updatedCenter = await beautyCenter.save();
  res.json(updatedCenter);
});