const express = require("express");
const fs = require("fs");
const path = require("path");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/roleMiddleware");

const router = express.Router();

const USERS_FILE = path.join(__dirname, "../api/auth/users.json");

// ✅ Route chỉ admin mới xem được danh sách users
router.get("/users", authMiddleware, checkRole, (req, res) => {
  let users = [];
  try {
    const data = fs.readFileSync(USERS_FILE, "utf8");
    users = JSON.parse(data);
  } catch {
    users = [];
  }

  res.json(users);
});

// ✅ Ví dụ route riêng cho admin: xem log hệ thống
router.get("/logs", authMiddleware, checkRole, (req, res) => {
  res.json({ message: "Chỉ admin mới thấy log này" });
});

module.exports = router;
