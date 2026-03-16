const Comment = require("../models/comment.model");

const createComment = async (req, res) => {
  try {
    const { tour_id, user_id, content, rating } = req.body;

    const newComment = new Comment({
      tour_id,
      user_id,
      content,
      rating,
    });

    await newComment.save();

    res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: newComment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating comment",
      error: error.message,
    });
  }
};

const getCommentsByTour = async (req, res) => {
  try {
    const { tourId } = req.params;

    const comments = await Comment.find({ tour_id: tourId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching comments",
      error: error.message,
    });
  }
};

const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content, rating } = req.body;

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { content, rating },
      { new: true },
    );

    if (!updatedComment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: updatedComment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating comment",
      error: error.message,
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting comment",
      error: error.message,
    });
  }
};

module.exports = {
    createComment,
    getCommentsByTour,
    updateComment,
    deleteComment,
}