const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const checkRole = require("../middlewares/roleMiddleware");
const router = express.Router();

const SECRET = process.env.JWT_SECRET || "supersecret";
const USERS_FILE = path.join(__dirname, "../api/auth/users.json");
const ADMIN_FILE = path.join(__dirname, "../api/auth/adm.json");

// 📌 Hàm đọc user từ file
function readUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function readAdmin() {
  try {
    const data = fs.readFileSync(ADMIN_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// 📌 Hàm ghi user ra file
function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// 🔑 LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const fileUsers = readUsers();
  const fileAdmins = readAdmin();
  const allUsers = [...fileAdmins, ...fileUsers];

  const user = allUsers.find((u) => u.username === username);
  if (!user) {
    return res.status(401).json({ error: "Sai username hoặc password" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: "Sai username hoặc password" });
  }

  // tạo token
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    SECRET,
    { expiresIn: "1h" }
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      fullname: user.fullname,
      role: user.role,
    },
  });
});

// 📝 REGISTER
router.post("/register", async (req, res) => {
  const { username, password, fullname } = req.body;

  if (!username || !password || !fullname) {
    return res.status(400).json({ error: "Thiếu thông tin đăng ký" });
  }

  const fileUsers = readUsers();
  const fileAdmins = readAdmin();
  const allUsers = [...fileAdmins, ...fileUsers];

  // kiểm tra trùng username
  if (allUsers.find((u) => u.username === username)) {
    return res.status(400).json({ error: "Username đã tồn tại" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: uuidv4(),
    username,
    password: hashedPassword,
    fullname,
    role: "user",
  };

  fileUsers.push(newUser);
  writeUsers(fileUsers);

  res.json({
    message: "Đăng ký thành công",
    user: { id: newUser.id, username, fullname, role: "user" },
  });
});

// 📌 GET all users (trừ password)
router.get("/", checkRole, (req, res) => {
  const fileUsers = readUsers();
  const fileAdmins = readAdmin();

  const safeUsers = fileUsers.map(({ password, ...rest }) => rest);
  const safeAdmins = fileAdmins.map(({ password, ...rest }) => rest);

  res.json([...safeAdmins, ...safeUsers]);
});

module.exports = router;
