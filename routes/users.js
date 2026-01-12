var express = require('express');
var router = express.Router();

const { register, login ,toggleStatus , changeRole} = require('../controllers/userController');

//Đăng ký
router.post('/register', register);

//Đăng nhập
router.post('/login', login);

// Chuyển trạng thái user
router.put("/toggle-status/:userId", toggleStatus);

// Chuyển quyền user
router.put("/change-role/:userId", changeRole);

module.exports = router;