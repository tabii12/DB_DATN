const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    return jwt.sign({ id:user._id, role: user.role }, "SECRET_KEY", { expiresIn: "1d" });
};

const register = async (req, res) => {
    try {
        const { name, phone, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email đã tồn tại!" });

        const newUser = new User({ name, phone, email, password});
        await newUser.save();

        res.status(201).json({ message: "Đăng ký thành công!", user: newUser });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Email hoặc mật khẩu không đúng!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Email hoặc mật khẩu không đúng!"});

        const token = generateToken(user);

        res.json({ message: "Đăng nhập thành công!", token, user });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error });
    }
};

const toggleStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User không tồn tại" });

        user.status = user.status === "active" ? "inactive" : "active";
        await user.save();

        res.json({ message: "Chuyển trạng thái thành công", status: user.status });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error });
    }
};

const changeRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User không tồn tại" });

        user.role = user.role === "user" ? "admin" : "user";
        await user.save();

        res.json({ message: "Chuyển quyền thành công", role: user.role });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

module.exports = {
    register,
    login,
    toggleStatus,
    changeRole,
}