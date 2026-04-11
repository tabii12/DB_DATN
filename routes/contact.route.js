const express = require("express");
const router = express.Router();

const contactController = require("../controllers/contact.controller");

// @route   POST api/contacts/create
// @desc    Khách hàng gửi yêu cầu liên hệ mới
router.post("/create", contactController.createContact);

// @route   GET api/contacts/all
// @desc    Lấy toàn bộ danh sách liên hệ (Cho Admin)
router.get("/all", contactController.getAllContacts);

// @route   GET api/contacts/:id
// @desc    Lấy chi tiết một yêu cầu liên hệ
router.get("/:id", contactController.getContactById);

// @route   PUT api/contacts/status/:id
// @desc    Cập nhật trạng thái xử lý (pending/contacted/...)
router.put("/status/:id", contactController.updateContactStatus);

// @route   DELETE api/contacts/:id
// @desc    Xóa yêu cầu liên hệ
router.delete("/:id", contactController.deleteContact);

module.exports = router;
