import BeautyCenter from "../models/beautyCentersModel.js";

const getBeautyCenters = async(req, res) => {
    try {
        // owner bilgisini populate ile çekiyoruz
        const beautyCenters = await BeautyCenter.find().populate('userId', 'full_name email phone role');
        if (!beautyCenters || beautyCenters.length === 0) {
            return res.status(404).json({ message: "No beauty centers found" });
        }
        res.status(200).json(beautyCenters);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching beauty centers' });
    }

};






export { getBeautyCenters }