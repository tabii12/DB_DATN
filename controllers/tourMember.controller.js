const TourMember = require("../models/tourMember.model");
const Booking = require("../models/booking.model");

const getAllTourMembers = async (req, res) => {
  try {
    const tourMembers = await TourMember.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: tourMembers.length,
      data: tourMembers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllTourMembersByTripId = async (req, res) => {
  try {
    const { trip_id } = req.params;

    const bookings = await Booking.find({ trip_id });

    const bookingIds = bookings.map((b) => b._id);

    const members = await TourMember.find({
      booking_id: { $in: bookingIds },
    });

    return res.status(200).json({
      success: true,
      total: members.length,
      data: members,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateTourMemberById = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, age, id_card } = req.body;

    const updateData = {
      ...(name && { name }),
      ...(age && { age }),
      ...(id_card && { id_card }),
    };

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No content to update",
      });
    }

    const updatedTourMember = await TourMember.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );

    if (!updatedTourMember) {
      return res.status(404).json({
        success: false,
        message: "Tour member not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tour member updated successfully",
      data: updatedTourMember,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteTourMemberById = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTourMember = await TourMember.findByIdAndDelete(id);

    if (!deletedTourMember) {
      return res.status(404).json({
        success: false,
        message: "Tour member not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tour member deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllTourMembers,
  getAllTourMembersByTripId,
  updateTourMemberById,
  deleteTourMemberById,
};
