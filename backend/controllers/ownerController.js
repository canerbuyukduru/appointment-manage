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

export { getMyBeautyCenter };
