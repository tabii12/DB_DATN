const Review = require("../models/review.model");

const createReview = async (req, res) => {
  try {
    const { user_id, tour_id, rating, comment } = req.body;

    const newReview = new Review({
      user_id,
      tour_id,
      rating,
      comment,
    });

    await newReview.save();

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: newReview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating review",
      error: error.message,
    });
  }
};

const getAllReviewsByTourId = async (req, res) => {
  try {
    const { tour_id } = req.params;
    const reviews = await Review.find({ tour_id });
    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching reviews",
      error: error.message,
    });
  }
};

const updateReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const { rating, comment } = req.body;

    const updateData = {
      ...(rating && { rating }),
      ...(comment && { comment }),
    };

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No content to update",
      });
    }

    const updatedReview = await Review.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: updatedReview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating review",
      error: error.message,
    });
  }
};

const deleteReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedReview = await Review.findByIdAndDelete(id);

    if (!deletedReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting review",
      error: error.message,
    });
  }
};

module.exports = {
  createReview,
  getAllReviewsByTourId,
  updateReviewById,
  deleteReviewById,
};
