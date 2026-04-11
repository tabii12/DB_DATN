const Contact = require("../models/contact.model");

// CREATE CONTACT (Khách hàng gửi form)
const createContact = async (req, res) => {
  try {
    const { name, email, phone, tour_id, content } = req.body;

    if (!name || !email || !phone || !tour_id || !content) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ các trường bắt buộc",
      });
    }

    const newContact = await Contact.create({
      name,
      email,
      phone,
      tour_id,
      content,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Gửi thông tin liên hệ thành công!",
      data: newContact,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL CONTACTS (Cho Admin quản lý)
const getAllContacts = async (req, res) => {
  try {
    // Populate tour_id để biết khách liên hệ từ tour nào
    const contacts = await Contact.find()
      .populate("tour_id", "name slug")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET CONTACT BY ID
const getContactById = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id)
      .populate("tour_id", "tourName slug")
      .lean();

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy yêu cầu liên hệ",
      });
    }

    return res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE STATUS (Admin cập nhật khi đã xử lý xong)
const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái là bắt buộc",
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: contact,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE CONTACT
const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy yêu cầu để xóa",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Xóa yêu cầu liên hệ thành công",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
};
