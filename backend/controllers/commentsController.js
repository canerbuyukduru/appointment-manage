import asyncHandler from "../middleware/asyncHandler.js";
import Comment from "../models/commentsModel.js";
import BeautyCenter from "../models/beautyCentersModel.js";
import Appointment from "../models/appoitmentsModel.js"

// @desc    Create new comment
// @route   POST /api/comments
// @access  Private (user only - completed appointment needed)
export const createComment = asyncHandler(async (req, res) => {
  const { beautyCenterId, rating, comment } = req.body;
  const userId = req.user._id;

  // Validasyon
  if (!rating || !comment) {
    res.status(400);
    throw new Error("beautyCenterId, rating ve comment zorunludur");
  }

  if (rating < 1 || rating > 5) {
    res.status(400);
    throw new Error("Rating 1 ile 5 arasında olmalıdır");
  }

  // Beauty center var mı?
  const center = await BeautyCenter.findById(beautyCenterId);
  if (!center) {
    res.status(404);
    throw new Error("Beauty center bulunamadı");
  }

  // Kullanıcının bu merkeze tamamlanmış bir randevusu var mı kontrol et
//   const hasCompletedAppointment = await Appointment.findOne({
//     userId,
//     beautyCenterId,
//     status: "completed",
//   });

//   if (!hasCompletedAppointment) {
//     res.status(403);
//     throw new Error("Yorum yapabilmek için bu merkeze tamamlanmış randevunuz olmalı");
//   }


  // Yorumu oluştur
  const newComment = await Comment.create({
    userId,
    beautyCenterId,
    rating,
    comment,
  });

  // Populate edilmiş yorumu döndür
  const populatedComment = await Comment.findById(newComment._id)
    .populate("userId", "fullName")
    .populate("beautyCenterId", "name");

  res.status(201).json({
    success: true,
    message: "Yorumunuz başarıyla eklendi",
    comment: populatedComment,
  });
});

// @desc    Get comments for a beauty center
// @route   GET /api/comments/:beautyCenterId
// @access  Public
export const getCommentsByCenter = asyncHandler(async (req, res) => {
  const { beautyCenterId } = req.params;
  const { page = 1, limit = 10, sort = "newest" } = req.query;

  // Beauty center var mı kontrol et
  const center = await BeautyCenter.findById(beautyCenterId);
  if (!center) {
    res.status(404);
    throw new Error("Beauty center bulunamadı");
  }

  // Sort seçeneği
  let sortOption = { createdAt: -1 }; // newest
  if (sort === "oldest") {
    sortOption = { createdAt: 1 };
  } else if (sort === "highest") {
    sortOption = { rating: -1, createdAt: -1 };
  } else if (sort === "lowest") {
    sortOption = { rating: 1, createdAt: -1 };
  }

  const skip = (page - 1) * limit;

  // Yorumları getir
  const [comments, totalCount, avgRating] = await Promise.all([
    Comment.find({ beautyCenterId })
      .populate("userId", "fullName")
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit)),
    Comment.countDocuments({ beautyCenterId }),
    Comment.aggregate([
      { $match: { beautyCenterId: center._id } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]),
  ]);

  res.json({
    success: true,
    comments,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      hasNext: page * limit < totalCount,
      hasPrev: page > 1,
    },
    avgRating: avgRating.length > 0 ? avgRating[0].avgRating.toFixed(1) : 0,
  });
});

// @desc    Get user's own comments
// @route   GET /api/comments/my-comments
// @access  Private
export const getMyComments = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const comments = await Comment.find({ userId })
    .populate("beautyCenterId", "name address location")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    comments,
  });
});

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private (user only - own comments)
export const updateComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id;

  const existingComment = await Comment.findById(id);

  if (!existingComment) {
    res.status(404);
    throw new Error("Yorum bulunamadı");
  }

  // Sadece kendi yorumunu güncelleyebilir
  if (existingComment.userId.toString() !== userId.toString()) {
    res.status(403);
    throw new Error("Bu yorumu güncelleme yetkiniz yok");
  }

  // Güncelleme
  if (rating) existingComment.rating = rating;
  if (comment) existingComment.comment = comment;

  await existingComment.save();

  const updatedComment = await Comment.findById(id)
    .populate("userId", "fullName")
    .populate("beautyCenterId", "name");

  res.json({
    success: true,
    message: "Yorumunuz güncellendi",
    comment: updatedComment,
  });
});

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private (user only - own comments)
export const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const comment = await Comment.findById(id);

  if (!comment) {
    res.status(404);
    throw new Error("Yorum bulunamadı");
  }

  // Sadece kendi yorumunu silebilir
  if (comment.userId.toString() !== userId.toString()) {
    res.status(403);
    throw new Error("Bu yorumu silme yetkiniz yok");
  }

  await Comment.findByIdAndDelete(id);

  res.json({
    success: true,
    message: "Yorumunuz silindi",
  });
});

// @desc    Owner reply to comment
// @route   PATCH /api/comments/:id/reply
// @access  Private (owner only)
export const ownerReplyComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { replyText } = req.body;
  const ownerId = req.user._id;

  if (!replyText || replyText.trim().length === 0) {
    res.status(400);
    throw new Error("Yanıt metni boş olamaz");
  }

  const comment = await Comment.findById(id).populate("beautyCenterId");

  if (!comment) {
    res.status(404);
    throw new Error("Yorum bulunamadı");
  }

  // Bu yorumun beauty center'ı bu owner'a ait mi?
  const center = await BeautyCenter.findOne({
    _id: comment.beautyCenterId._id,
    ownerId,
  });

  if (!center) {
    res.status(403);
    throw new Error("Bu yoruma yanıt verme yetkiniz yok");
  }

  // Yanıtı ekle
  comment.ownerReply = {
    text: replyText,
    repliedAt: new Date(),
  };

  await comment.save();

  const updatedComment = await Comment.findById(id)
    .populate("userId", "fullName")
    .populate("beautyCenterId", "name");

  res.json({
    success: true,
    message: "Yanıtınız eklendi",
    comment: updatedComment,
  });
});