const jwt = require("jsonwebtoken");

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role: role }, 
    process.env.JWT_SECRET || "MagicWatchesSecretKey", 
    { expiresIn: "7d" } 
  );
};

module.exports = generateToken;