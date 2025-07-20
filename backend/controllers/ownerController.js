import BeautyCenter from "../models/beautyCentersModel.js";

const getMyBeautyCenter = async (req, res) => {
  const owner = req.user;
  try {
    if (!owner || owner.role !== "owner") {
      return res.status(403).json({ message: "Access denied. Only owners can access this route." });
    }

    // Fetch the beauty center associated with the owner
    const beautyCenter = await BeautyCenter.findOne({ userId: owner._id });
    if (!beautyCenter) {
      return res.status(404).json({ message: "Beauty center not found" });
    }
    return res.status(200).json(beautyCenter);
  } catch (error) {
    console.error("Error fetching beauty center:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


const updateMyBeautyCenter = async (req, res) => {
  const owner = req.user;
  const {
    name,
    location,
    workingHours,
    customHolidays,
    email,
    description,
    phone
  } = req.body;

  try {
    if (!owner || owner.role !== "owner") {
      return res.status(403).json({ message: "Access denied. Only owners can access this route." });
    }

    // Fetch the beauty center associated with the owner
    const beautyCenter = await BeautyCenter.findOne({ userId: owner._id });
    if (!beautyCenter) {
      return res.status(404).json({ message: "Beauty center not found" });
    }

    // Update the beauty center details
    if (name !== undefined) beautyCenter.name = name;
    if (location !== undefined) beautyCenter.location = location;
    if (workingHours !== undefined) beautyCenter.workingHours = workingHours;
    if (customHolidays !== undefined) beautyCenter.customHolidays = customHolidays;
    if (email !== undefined) beautyCenter.email = email;
    if (description !== undefined) beautyCenter.description = description;
    if (phone !== undefined) beautyCenter.phone = phone;
    await beautyCenter.save();
    return res.status(200).json(beautyCenter);
  } catch (error) {
    console.error("Error updating beauty center:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { getMyBeautyCenter, updateMyBeautyCenter };
